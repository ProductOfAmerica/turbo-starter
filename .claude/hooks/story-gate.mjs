// Story gate: Claude Code hooks that hold UI work to its stories (registered in
// .claude/settings.json). One script, three modes:
//
//   session-start  SessionStart. Records a hash of every watched file, so the stop check covers
//                  only what this session changes. A resumed or compacted session keeps its record.
//   post-batch     PostToolBatch. After Claude writes or edits UI files, runs the story tests
//                  related to them (light theme) and returns failures as context. Never blocks.
//   stop           Stop. For the files changed since the record, requires a story for every
//                  component, runs the related story tests in both themes (all of them when the
//                  Storybook or Vitest config, or a globals.css, changed) and type-checks. Problems
//                  go back to Claude as context, so it keeps working instead of stopping. Claude
//                  Code stops continuing after eight in a row.
//
// Tools run through `node` and their JS entry points: Windows can't spawn the .cmd shims in
// node_modules/.bin without a shell. Context stays under Claude Code's 10,000-character cap.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { stripVTControlCharacters } from 'node:util';

const WATCHED = [
	'packages/ui/src',
	'packages/ui/stories',
	'packages/ui/tests',
	'apps/web/src',
	'apps/web/stories',
	'apps/web/.storybook',
	'apps/web/vitest.config.mts',
	'apps/web/vitest.shims.d.ts',
];
// A change to one of these can affect every story.
const AFFECTS_ALL = [/^apps\/web\/\.storybook\//, /^apps\/web\/vitest\.(config\.mts|shims\.d\.ts)$/, /\/globals\.css$/];
const CODE = /\.(tsx?|mts)$/;
const EDIT_TOOLS = new Set(['Write', 'Edit', 'MultiEdit']);
const MAX_CONTEXT = 9000;
// Keep below the hook timeouts in .claude/settings.json (300 and 600 seconds).
const BUDGET_MS = { 'post-batch': 280_000, stop: 570_000 };

const toPosix = (path) => path.replaceAll('\\', '/');
// Windows paths compare case-insensitively.
const pathKey = (path) => (process.platform === 'win32' ? toPosix(path).toLowerCase() : toPosix(path));

function readInput() {
	const text = readFileSync(0, 'utf8');
	return text.trim() ? JSON.parse(text) : {};
}

function findRoot(cwd) {
	for (let dir = resolve(cwd); ; dir = dirname(dir)) {
		if (existsSync(join(dir, 'pnpm-workspace.yaml')) && existsSync(join(dir, 'apps/web/package.json'))) return dir;
		if (dirname(dir) === dir) return null;
	}
}

// The worktrees of the project's repository, as the project's own git metadata lists them.
// git runs in the project: on Windows a command's working directory is searched for the
// executable first, so nothing is ever spawned in a directory that isn't trusted.
function worktrees(project) {
	const result = spawnSync('git', ['worktree', 'list', '--porcelain'], {
		cwd: project,
		encoding: 'utf8',
		windowsHide: true,
	});
	if (result.status !== 0) return [];
	// One record per worktree, separated by blank lines. A prunable one's directory is gone, so
	// whatever now sits at its path isn't that worktree.
	return result.stdout
		.split(/\r?\n\r?\n/)
		.map((record) => record.split(/\r?\n/))
		.filter((lines) => !lines.some((line) => /^(prunable|bare)\b/.test(line)))
		.flatMap((lines) => lines.filter((line) => line.startsWith('worktree ')))
		.map((line) => pathKey(line.slice('worktree '.length).trim()));
}

// The checkout to check. The hook runs that checkout's scripts and node_modules, so it trusts
// only the project Claude Code was started in (CLAUDE_PROJECT_DIR) and the project's own
// worktrees, which cwd follows Claude into. Any other directory Claude visits, including one
// nested in the project, falls back to the project.
function resolveRoot(cwd) {
	// biome-ignore lint/suspicious/noUndeclaredEnvVars: Claude Code sets it for hooks; no Turborepo task reads it
	const projectDir = process.env.CLAUDE_PROJECT_DIR;
	const project = projectDir && findRoot(projectDir);
	if (!project) return null;
	const candidate = cwd ? findRoot(cwd) : null;
	if (!candidate || pathKey(candidate) === pathKey(project)) return project;
	return worktrees(project).includes(pathKey(candidate)) ? candidate : project;
}

function listFiles(path) {
	if (!existsSync(path)) return [];
	const entries = readdirSync(path, { withFileTypes: true });
	return entries.flatMap((entry) => {
		const child = join(path, entry.name);
		if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : listFiles(child);
		return [child];
	});
}

function hashWatched(root) {
	const hashes = {};
	for (const target of WATCHED) {
		const path = join(root, target);
		if (!existsSync(path)) continue;
		for (const file of statSync(path).isDirectory() ? listFiles(path) : [path]) {
			hashes[toPosix(relative(root, file))] = createHash('sha1').update(readFileSync(file)).digest('hex');
		}
	}
	return hashes;
}

function recordPath(sessionId, root) {
	if (!/^[\w-]+$/.test(sessionId ?? '')) throw new Error(`unexpected session_id: ${sessionId}`);
	const checkout = createHash('sha1').update(root).digest('hex').slice(0, 8);
	return join(tmpdir(), 'story-gate', `${sessionId}-${checkout}.json`);
}

const isWatched = (path) => WATCHED.some((target) => path === target || path.startsWith(`${target}/`));

function writeRecord(sessionId, root, hashes) {
	const record = recordPath(sessionId, root);
	mkdirSync(dirname(record), { recursive: true });
	writeFileSync(record, JSON.stringify(hashes));
}

// Files changed since the session's record, which the last passing stop check moved forward.
// Without one (a worktree entered mid-session, or a record that was cleaned up), fall back to
// uncommitted changes.
function changedFiles(sessionId, root, now) {
	const record = recordPath(sessionId, root);
	if (existsSync(record)) {
		const before = JSON.parse(readFileSync(record, 'utf8'));
		const paths = new Set([...Object.keys(before), ...Object.keys(now)]);
		return [...paths].filter((path) => before[path] !== now[path]);
	}
	const status = spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], {
		cwd: root,
		encoding: 'utf8',
		windowsHide: true,
	});
	if (status.status !== 0) return [];
	// Each entry is "XY path"; a rename or copy is followed by one more field, its old path.
	const fields = status.stdout.split('\0');
	const paths = [];
	for (let i = 0; i < fields.length; i++) {
		if (!fields[i]) continue;
		paths.push(fields[i].slice(3));
		if (/^[RC]/.test(fields[i])) i++;
	}
	return paths.filter(isWatched);
}

// Runs a command with a time limit, killing its whole process tree when the limit passes.
function run(command, args, { cwd, env = process.env, timeoutMs }) {
	return new Promise((done) => {
		const child = spawn(command, args, {
			cwd,
			env,
			stdio: ['ignore', 'pipe', 'pipe'],
			detached: process.platform !== 'win32',
			windowsHide: true,
		});
		let output = '';
		const keep = (chunk) => {
			output = (output + chunk).slice(-20_000);
		};
		child.stdout.on('data', keep);
		child.stderr.on('data', keep);
		let timedOut = false;
		const timer = setTimeout(
			() => {
				timedOut = true;
				if (process.platform === 'win32') {
					// By full path: the hook's own working directory follows Claude and isn't trusted.
					// biome-ignore lint/suspicious/noUndeclaredEnvVars: a Windows system variable; no Turborepo task reads it
					const taskkill = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'taskkill.exe');
					spawnSync(taskkill, ['/pid', String(child.pid), '/T', '/F'], { cwd, windowsHide: true });
				} else {
					process.kill(-child.pid, 'SIGKILL');
				}
			},
			Math.max(timeoutMs, 1000)
		);
		child.on('error', (error) => {
			clearTimeout(timer);
			done({ code: -1, output: String(error), timedOut });
		});
		child.on('close', (code) => {
			clearTimeout(timer);
			done({ code, output: stripVTControlCharacters(output), timedOut });
		});
	});
}

// Runs the story and unit tests (all of them when `files` is null) and summarizes the failures.
async function storyTests(root, files, theme, deadline) {
	const web = join(root, 'apps/web');
	const out = mkdtempSync(join(tmpdir(), 'story-gate-'));
	const report = join(out, 'report.json');
	const target = files ? ['related', ...files.map((file) => join(root, file)), '--run', '--passWithNoTests'] : ['run'];
	const result = await run(
		process.execPath,
		[join(web, 'node_modules/vitest/vitest.mjs'), ...target, '--reporter=json', `--outputFile=${report}`],
		{ cwd: web, env: { ...process.env, STORY_THEME: theme }, timeoutMs: deadline - Date.now() }
	);
	const json = existsSync(report) ? JSON.parse(readFileSync(report, 'utf8')) : null;
	rmSync(out, { recursive: true, force: true });

	const scope = files ? 'related tests' : 'all tests';
	if (result.timedOut) return { ok: false, summary: `The ${scope} (${theme}) didn't finish in time.` };
	if (/Executable doesn't exist|playwright install/i.test(result.output)) {
		return {
			ok: false,
			summary: 'Story tests need Chromium. Install it once: pnpm --filter web exec playwright install chromium',
		};
	}
	if (result.code === 0) return { ok: true };
	if (!json) return { ok: false, summary: `The ${scope} (${theme}) failed to run:\n${result.output.slice(-2000)}` };

	const failures = json.testResults.flatMap((file) =>
		file.assertionResults
			.filter((test) => test.status === 'failed')
			.map((test) => {
				const lines = stripVTControlCharacters(test.failureMessages?.[0] ?? '')
					.split('\n')
					.filter((line) => line.trim() && !line.includes('node_modules'))
					.slice(0, 5);
				return `- ${toPosix(relative(root, file.name))} > ${test.title}\n  ${lines.join('\n  ')}`;
			})
	);
	const summary = failures.length
		? `${json.numFailedTests} of ${json.numTotalTests} ${scope} fail (${theme} theme):\n${failures.slice(0, 15).join('\n')}`
		: `The ${scope} (${theme}) failed:\n${result.output.slice(-2000)}`;
	return { ok: false, summary };
}

// A new worktree has no node_modules until someone installs them.
const installed = (root) =>
	existsSync(join(root, 'apps/web/node_modules/vitest/vitest.mjs')) &&
	existsSync(join(root, 'node_modules/turbo/bin/turbo'));

function emit(event, text) {
	const additionalContext = text.length > MAX_CONTEXT ? `${text.slice(0, MAX_CONTEXT)}\n[cut short]` : text;
	process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext } }));
}

async function sessionStart(input, root) {
	if (existsSync(recordPath(input.session_id, root))) return;
	writeRecord(input.session_id, root, hashWatched(root));
}

async function postBatch(input, root, deadline) {
	const files = (input.tool_calls ?? [])
		.filter((call) => EDIT_TOOLS.has(call.tool_name) && typeof call.tool_input?.file_path === 'string')
		.map((call) => call.tool_input.file_path)
		.map((path) => toPosix(isAbsolute(path) ? relative(root, path) : path))
		.filter((path) => isWatched(path) && CODE.test(path) && existsSync(join(root, path)));
	if (files.length === 0 || !installed(root)) return;
	const result = await storyTests(root, [...new Set(files)], 'light', deadline);
	if (!result.ok) emit('PostToolBatch', `Story check after your edits:\n${result.summary}`);
}

async function stop(input, root, deadline) {
	// Hashed before the checks run, so a file edited while they run is checked next time.
	const now = hashWatched(root);
	const changed = changedFiles(input.session_id, root, now).filter((path) => existsSync(join(root, path)));
	if (changed.length === 0) return;

	const problems = [];
	const { storyPathFor } = await import(pathToFileURL(join(root, 'scripts/check-stories.mjs')).href);
	for (const source of changed) {
		const story = storyPathFor(source);
		if (story && !existsSync(join(root, story))) problems.push(`- ${source} has no story. Add ${story}.`);
	}

	const code = changed.filter((path) => CODE.test(path));
	const all = changed.some((path) => AFFECTS_ALL.some((pattern) => pattern.test(path)));
	if ((all || code.length) && !installed(root)) {
		problems.push(`- Run pnpm install in ${root}, so the story tests and the type check can run.`);
	}
	// Both themes and the type check run side by side. Each Vitest process pre-bundles into its own
	// directory (apps/web/vitest.config.mts), so the two story runs don't disturb each other.
	const ready = installed(root);
	const files = all ? null : code;
	const [light, dark, types] = await Promise.all([
		ready && (all || code.length) ? storyTests(root, files, 'light', deadline) : null,
		ready && (all || code.length) ? storyTests(root, files, 'dark', deadline) : null,
		ready && code.length
			? run(
					process.execPath,
					[join(root, 'node_modules/turbo/bin/turbo'), 'run', 'check-types', '--output-logs=errors-only'],
					{ cwd: root, timeoutMs: deadline - Date.now() }
				)
			: null,
	]);
	// A story that fails in both themes is reported once.
	if (light && !light.ok) problems.push(light.summary);
	else if (dark && !dark.ok) problems.push(dark.summary);
	if (types?.timedOut) problems.push("The type check didn't finish in time.");
	else if (types && types.code !== 0) problems.push(`The type check fails:\n${types.output.slice(-3000)}`);

	if (problems.length) {
		emit(
			'Stop',
			[
				'Story gate: the UI work in this session is not done yet.',
				...problems,
				'Conventions and the accessibility policy are in .claude/rules/storybook.md.',
			].join('\n')
		);
		return;
	}
	// Everything changed so far passed, so the next stop checks only what changes after this.
	writeRecord(input.session_id, root, now);
}

const MODES = { 'session-start': sessionStart, 'post-batch': postBatch, stop };

try {
	const mode = process.argv[2];
	if (!(mode in MODES)) throw new Error(`unknown mode "${mode}"; expected ${Object.keys(MODES).join(', ')}`);
	const input = readInput();
	const root = resolveRoot(input.cwd);
	if (root) await MODES[mode](input, root, Date.now() + (BUDGET_MS[mode] ?? 25_000));
} catch (error) {
	console.error(`story-gate: ${error.stack ?? error}`);
	process.exit(1);
}
