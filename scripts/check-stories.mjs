// Checks that every component that needs a Storybook story has one, and lists the accessibility
// exceptions in story files. With --manifest it also checks Storybook's components manifest,
// which the Storybook MCP server serves to agents: every such component has an entry, docgen read
// the component's own source file without errors, and UI entries import it from its own @repo/ui
// module. The Claude Code Stop hook imports storyPathFor from here.
//
//   node scripts/check-stories.mjs              # no build needed
//   node scripts/check-stories.mjs --manifest   # after pnpm build:storybook; CI runs this
//
// Each package keeps its stories, which mirror its source tree:
//   packages/ui/src/components/button.tsx         -> packages/ui/stories/button.stories.tsx
//   apps/web/src/components/sections/footer.tsx   -> apps/web/stories/web/components/sections/footer.stories.tsx
//   apps/web/src/app/not-found.tsx                -> apps/web/stories/web/app/not-found.stories.tsx
// In app/, only page, error, not-found and loading need stories; layout and global-error render
// the <html> shell, which a story can't.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, posix, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = 'apps/web/storybook-static/manifests/components.json';

// Components that need no story, and why.
export const EXEMPT = {
	'apps/web/src/components/structured-data.tsx': 'renders a JSON-LD script tag',
	'apps/web/src/components/theme-provider.tsx': 'wraps next-themes; the Storybook preview renders the same provider',
	'apps/web/src/components/web-vitals.tsx': 'reports metrics and renders nothing',
};

const SOURCE_DIRS = ['packages/ui/src/components', 'apps/web/src/components', 'apps/web/src/app'];
const STORY_DIRS = ['packages/ui/stories', 'apps/web/stories'];

const toPosix = (path) => path.replaceAll('\\', '/');

function listFiles(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		return entry.isDirectory() ? listFiles(path) : [path];
	});
}

// The story file a source file needs, as a repo-relative path, or null if it needs none.
export function storyPathFor(source) {
	const file = toPosix(source);
	if (file in EXEMPT || /\.test\.tsx?$/.test(file)) return null;
	const ui = file.match(/^packages\/ui\/src\/components\/([^/]+)\.tsx$/);
	if (ui) return `packages/ui/stories/${ui[1]}.stories.tsx`;
	const web = file.match(/^apps\/web\/src\/(components\/.+|app\/(?:.+\/)?(?:page|error|not-found|loading))\.tsx$/);
	if (web) return `apps/web/stories/web/${web[1]}.stories.tsx`;
	return null;
}

// Every source file that needs a story: { source, story, exists }, with repo-relative paths.
export function requiredStories(root = ROOT) {
	return SOURCE_DIRS.flatMap((dir) => listFiles(join(root, dir)))
		.map((path) => toPosix(relative(root, path)))
		.map((source) => ({ source, story: storyPathFor(source) }))
		.filter(({ story }) => story !== null)
		.map((entry) => ({ ...entry, exists: existsSync(join(root, entry.story)) }));
}

// 'todo' checks and narrowed or disabled axe rules in story files, with their scope (the whole
// file or one story) and the comment above them, which must name the axe rule.
export function a11yExceptions(root = ROOT) {
	const found = [];
	const stories = STORY_DIRS.flatMap((dir) => listFiles(join(root, dir))).filter((file) =>
		file.endsWith('.stories.tsx')
	);
	for (const path of stories) {
		const source = readFileSync(path, 'utf8');
		const lines = source.split(/\r?\n/);
		const lineOf = (offset) => source.slice(0, offset).split('\n').length - 1;
		const scopeAt = (index) => {
			for (let i = index; i >= 0; i--) {
				const story = lines[i].match(/^export const (\w+)/);
				if (story) return story[1];
			}
			return 'all stories';
		};
		// The comment sits above `parameters:`, which Biome may have wrapped onto lines of its own.
		const commentAbove = (index) => {
			let anchor = index;
			for (let i = index; i >= Math.max(0, index - 2); i--) {
				if (/^\s*parameters:/.test(lines[i])) anchor = i;
			}
			const comment = [];
			for (let i = anchor - 1; i >= 0 && lines[i].trim().startsWith('//'); i--) {
				comment.unshift(lines[i].trim().replace(/^\/\/\s?/, ''));
			}
			return comment.join(' ');
		};
		const story = toPosix(relative(root, path));
		// A story can turn the check back on under a file-wide 'todo'.
		for (const match of source.matchAll(/test: 'error'/g)) {
			found.push({ story, scope: scopeAt(lineOf(match.index)), kind: 'enforced', rule: null, explained: true });
		}
		for (const match of source.matchAll(/test: 'todo'/g)) {
			const index = lineOf(match.index);
			const text = commentAbove(index);
			const rule = text.match(/^a11y todo, ([a-z-]+):/)?.[1];
			found.push({ story, scope: scopeAt(index), kind: 'todo', rule: rule ?? null, explained: rule !== undefined });
		}
		for (const match of source.matchAll(/\{\s*id: '([a-z-]+)',\s*(?:enabled: false|selector: '([^']*)')/g)) {
			const index = lineOf(match.index);
			found.push({
				story,
				scope: scopeAt(index),
				kind: match[2] === undefined ? 'rule off' : 'rule narrowed',
				rule: match[1],
				selector: match[2] ?? null,
				explained: commentAbove(index).length > 0,
			});
		}
	}
	return found;
}

// Windows paths differ in separators and drive-letter case.
const samePath = (a, b) => {
	const normalize = (path) => path.replaceAll('\\', '/').replace(/^[a-z]:/i, (drive) => drive.toLowerCase());
	return normalize(a) === normalize(b);
};

// react-docgen-typescript returns nothing for a component without parameters, or for a
// third-party component re-exported as is (`const Combobox = ComboboxPrimitive.Root`). Storybook
// then leaves the entry's description, summary and subcomponents out too, but its stories stay.
function expectedDocgenGap(source, name) {
	const code = readFileSync(join(ROOT, source), 'utf8');
	if (new RegExp(`function ${name}\\(\\)`).test(code)) return 'takes no props';
	if (new RegExp(`const ${name} = \\w+\\.\\w+;`).test(code)) return 're-exports a third-party component';
	return null;
}

// Problems in the built manifest, and the components it documents without props or description.
function checkManifest(required) {
	const { components } = JSON.parse(readFileSync(join(ROOT, MANIFEST), 'utf8'));
	// Entry paths are story files relative to apps/web, such as ../../packages/ui/stories/button.stories.tsx.
	const byStory = new Map(Object.values(components).map((entry) => [posix.join('apps/web', entry.path), entry]));
	const problems = [];
	const gaps = [];
	for (const { source, story } of required) {
		const entry = byStory.get(story);
		if (!entry) {
			problems.push(`${story}: no manifest entry (the story file is missing, or its meta has no component)`);
			continue;
		}
		const documented = entry.reactDocgenTypescript?.filePath;
		if (documented && !samePath(documented, join(ROOT, source))) {
			problems.push(`${story}: meta.component is defined in ${documented}, not ${source}`);
		}
		const error = entry.error ?? entry.reactDocgenTypescriptError ?? entry.reactDocgenError;
		if (!documented || error) {
			const gap = expectedDocgenGap(source, entry.name);
			if (gap) gaps.push(`${entry.name} (${gap})`);
			else problems.push(`${story}: ${error?.message ?? `no docgen for ${entry.name}`}`);
		}
		// A story that imports a UI component by a relative path makes the manifest tell agents to
		// import it from '@repo/ui', which doesn't resolve.
		const module = `@repo/ui/components/${basename(source, '.tsx')}`;
		if (source.startsWith('packages/ui/') && !entry.import?.includes(`from '${module}'`)) {
			problems.push(`${story}: the import line doesn't import ${entry.name} from '${module}'`);
		}
		for (const { name, error: storyError } of entry.stories ?? []) {
			if (storyError) problems.push(`${story}: story ${name}: ${storyError.message}`);
		}
		// Every prop needs a description, which the MCP docs show next to it. `asChild` is exempt (it
		// means the same on every Radix part), and so is a part that re-exports a library component,
		// which has no signature of ours to carry a comment.
		for (const part of [entry, ...Object.values(entry.subcomponents ?? {})]) {
			if (expectedDocgenGap(source, part.name) === 're-exports a third-party component') continue;
			for (const [prop, { description }] of Object.entries(part.reactDocgenTypescript?.props ?? {})) {
				if (!description && prop !== 'asChild') {
					problems.push(`${story}: ${part.name} prop \`${prop}\` has no JSDoc description`);
				}
			}
		}
	}
	return { problems, gaps };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const required = requiredStories();
	const missing = required.filter(({ exists }) => !exists);
	console.log(`Stories: ${required.length - missing.length} of ${required.length} required components have one.`);
	for (const { source, story } of missing) console.log(`  missing ${story} (for ${source})`);
	const exceptions = a11yExceptions();
	console.log(`Accessibility exceptions: ${exceptions.filter(({ kind }) => kind !== 'enforced').length}`);
	for (const { kind, rule, selector, story, scope, explained } of exceptions) {
		if (kind === 'enforced') console.log(`  enforced again: ${story} (${scope})`);
		else
			console.log(
				`  ${kind} ${rule ?? '(no rule named)'}${selector ? ` to ${selector}` : ''}: ${story} (${scope})${explained ? '' : ' UNEXPLAINED'}`
			);
	}
	const unexplained = exceptions.filter(({ explained }) => !explained);
	if (unexplained.length) {
		console.log(
			"Each exception needs a comment above it naming the axe rule, starting 'a11y todo, <rule>:' for a todo."
		);
	}
	let problems = [];
	if (process.argv.includes('--manifest') && !existsSync(join(ROOT, MANIFEST))) {
		console.error(`\n${MANIFEST} not found. Run pnpm build:storybook first.`);
		problems = ['no manifest'];
	} else if (process.argv.includes('--manifest')) {
		const manifest = checkManifest(required);
		problems = manifest.problems;
		console.log(
			`\nIn the manifest without props or description (${manifest.gaps.length}): ${manifest.gaps.join(', ')}`
		);
		if (problems.length) {
			console.error(`\n${problems.length} problem(s) in ${MANIFEST}:`);
			for (const problem of problems) console.error(`  ${problem}`);
		} else {
			console.log(`${MANIFEST}: all ${required.length} components documented.`);
		}
	}
	process.exitCode = missing.length || unexplained.length || problems.length ? 1 : 0;
}
