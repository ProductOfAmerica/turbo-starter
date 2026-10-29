import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { storybookNextJsPlugin } from '@storybook/nextjs-vite/vite-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, type Plugin } from 'vitest/config';

// Each Vitest process pre-bundles dependencies into a directory of its own. In the shared one
// Storybook's plugin picks, a run that starts while another is going (the story-gate hook next to
// `pnpm test`, or Storybook's test widget) rebuilds it under the first run, whose imports then fail
// with "Failed to fetch dynamically imported module". Directories of processes that didn't exit
// cleanly are removed by the next run.
const depCaches = path.join(import.meta.dirname, 'node_modules/.cache/vitest-deps');
const isRunning = (pid: number) => {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return (error as NodeJS.ErrnoException).code === 'EPERM';
	}
};
for (const pid of existsSync(depCaches) ? readdirSync(depCaches) : []) {
	if (!isRunning(Number(pid))) rmSync(path.join(depCaches, pid), { recursive: true, force: true });
}
const depCache = path.join(depCaches, String(process.pid));
process.on('exit', () => rmSync(depCache, { recursive: true, force: true }));
const ownDepCache: Plugin = { name: 'own-dep-cache', enforce: 'post', config: () => ({ cacheDir: depCache }) };

// https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
//
// Three projects: `storybook` runs every story as a test, and `unit` (apps/web, in Node) and `ui`
// (packages/ui, in the browser) run plain tests for code no story can reach. Only one project uses
// the Storybook plugin on purpose: when Storybook runs these tests
// itself (its test widget or the MCP test-run tool), it renames every project that uses the plugin
// after the config dir, so a second one for the dark theme would collide. `pnpm test` runs the
// stories again with STORY_THEME=dark.
export default defineConfig({
	plugins: [ownDepCache],
	// Scan every story up front so Vite pre-bundles their dependencies before the first test runs.
	// Discovering one mid-run makes Vite reload the page, and the affected tests fail. Vite scans only
	// when it has no cached result, which the fresh directory above guarantees, so a story that adds an
	// import never hits a cache made before it.
	optimizeDeps: {
		entries: [
			'stories/**/*.stories.tsx',
			'../../packages/ui/stories/**/*.stories.tsx',
			'.storybook/preview.tsx',
			'../../packages/ui/tests/**/*.test.tsx',
		],
	},
	// tsconfig.json's `jsx: preserve` (Next.js's setting) leaves JSX in place. Storybook's Next.js plugin
	// compiles it for the files tests import, but coverage also transforms the files no test imports, and
	// those, like the unit project's files, need Vite to compile the JSX.
	oxc: { jsx: { runtime: 'automatic' } },
	test: {
		// https://storybook.js.org/docs/writing-tests/test-coverage
		coverage: {
			// Not the default v8: Vite's CommonJS interop for `import * as React` adds branches to line 1
			// of each such file, which no test can take. Istanbul instruments the source before that.
			provider: 'istanbul',
			// Every source file, so ones no story reaches show up at 0% instead of being left out.
			include: ['src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
			// packages/ui is outside this project's root.
			allowExternal: true,
			// Every file stays fully covered, except code no test can reach in these CLI-written components
			// (left unedited, see CLAUDE.md). A negative threshold is how many may stay uncovered:
			// - carousel: onSelect's `if (!api)`, whose only caller already checks, and the
			//   `orientation ||` fallback, unreachable because `orientation` defaults to 'horizontal'.
			// - input-otp: the empty slot for an `index` past `maxLength`.
			// - slider: neither `value` nor `defaultValue`, which renders two thumbs for Radix's one value.
			// Storybook's test widget runs only the story tests, so files that only the unit tests reach
			// would fail there; it sets VITEST_STORYBOOK (not a documented API, from addon-vitest's source).
			thresholds: process.env.VITEST_STORYBOOK
				? {}
				: {
						'src/**/*.{ts,tsx}': { 100: true, perFile: true },
						'../../packages/ui/src/**/!(carousel|input-otp|slider).{ts,tsx}': { 100: true, perFile: true },
						'../../packages/ui/src/components/carousel.tsx': {
							lines: 100,
							functions: 100,
							statements: -1,
							branches: -4,
						},
						'../../packages/ui/src/components/input-otp.tsx': {
							lines: 100,
							functions: 100,
							statements: 100,
							branches: -1,
						},
						'../../packages/ui/src/components/slider.tsx': {
							lines: 100,
							functions: 100,
							statements: 100,
							branches: -1,
						},
					},
		},
		projects: [
			{
				extends: true,
				plugins: [
					storybookTest({
						configDir: path.join(import.meta.dirname, '.storybook'),
						// motion: 'reduce' turns animations off in story tests (see .storybook/preview.tsx).
						initialGlobals: { theme: process.env.STORY_THEME ?? 'light', motion: 'reduce' },
					}),
				],
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [{ browser: 'chromium' }],
						// No `viewport`: before each story the plugin resizes the page to the story's viewport
						// global (`globals: { viewport: { value: 'mobile1' } }`), or to 1200x900 without one.
					},
				},
			},
			{
				extends: true,
				// The storybook project gets the `@/` alias from Storybook's Next.js plugin. Code a story also
				// renders belongs in a story: this project compiles it differently, so coverage counts its
				// statements twice, at slightly different positions, and the copy no test runs stays uncovered.
				resolve: { alias: { '@': path.join(import.meta.dirname, 'src') } },
				test: {
					name: 'unit',
					include: ['src/**/*.test.{ts,tsx}'],
					environment: 'node',
				},
			},
			{
				extends: true,
				// The same Next.js plugin and browser as the storybook project, so packages/ui code compiles the
				// same way in both and coverage merges cleanly.
				plugins: [storybookNextJsPlugin()],
				test: {
					name: 'ui',
					include: ['../../packages/ui/tests/**/*.test.{ts,tsx}'],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [{ browser: 'chromium' }],
					},
				},
			},
		],
	},
});
