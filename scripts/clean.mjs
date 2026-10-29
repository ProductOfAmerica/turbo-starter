// Deletes build and test caches from the workspace root and every workspace package,
// so the next dev server, build, or test run starts cold.
//
// node_modules is left alone on purpose. On Windows, pnpm links workspace packages
// with junctions (apps/web/node_modules/@repo/ui -> packages/ui), so deleting it
// safely takes more care than this script needs. Run `pnpm install` to repair
// dependencies instead.
//
// next-env.d.ts is kept too. Next.js manages it and rewrites it on every dev and
// build, so deleting it gains nothing, and without it `pnpm check-types` loses the
// Next.js types for image and CSS imports until the next dev or build.
import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';

const ARTIFACTS = ['.next', '.turbo', 'test-results', 'playwright-report'];

// Ask pnpm for the workspace projects so packages added later are covered too.
// A fixed command string, so the shell sees no outside input.
const projects = JSON.parse(execSync('pnpm ls --recursive --depth -1 --json', { encoding: 'utf8' }));

let removed = 0;
for (const { path } of projects) {
	for (const artifact of ARTIFACTS) {
		const target = join(path, artifact);
		if (!existsSync(target)) continue;
		rmSync(target, { recursive: true, force: true });
		console.log(`removed ${relative(process.cwd(), target)}`);
		removed++;
	}
}
console.log(removed ? `Done: removed ${removed} item(s).` : 'Nothing to clean.');
