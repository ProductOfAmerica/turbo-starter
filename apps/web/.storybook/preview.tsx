import type { Decorator, Preview } from '@storybook/nextjs-vite';
import { ThemeProvider } from '@/components/theme-provider';
import './preview.css';

// The app's own provider, set up as in src/app/layout.tsx. next-themes puts the theme class on
// <html>, so portal content rendered into <body> is themed too, and sonner's Toaster reads the theme
// from useTheme(). The key remounts the provider when the toolbar (or a test run's STORY_THEME)
// changes the theme. Storybook renders only on the client, where React never runs next-themes'
// inline script and warns about it in every story; a data-block type keeps the script inert.
const withTheme: Decorator = (Story, { globals }) => {
	const theme = globals.theme === 'dark' ? 'dark' : 'light';
	return (
		<ThemeProvider
			key={theme}
			attribute="class"
			defaultTheme={theme}
			enableSystem={false}
			disableTransitionOnChange
			scriptProps={{ type: 'application/json' }}
		>
			<Story />
		</ThemeProvider>
	);
};

// Story tests set the motion global to 'reduce' (vitest.config.mts). Overlays animate in from
// opacity 0 and stay mounted until their exit animation ends, so without this an assertion or the
// a11y check can catch one half-faded. Storybook's own UI keeps the animations.
const withoutMotionInTests: Decorator = (Story, { globals }) => (
	<>
		{globals.motion === 'reduce' && (
			<style>{'*, *::before, *::after { animation: none !important; transition: none !important; }'}</style>
		)}
		<Story />
	</>
);

const preview: Preview = {
	decorators: [withTheme, withoutMotionInTests],
	globalTypes: {
		theme: {
			description: 'Color theme',
			toolbar: {
				title: 'Theme',
				icon: 'circlehollow',
				items: [
					{ value: 'light', title: 'Light' },
					{ value: 'dark', title: 'Dark' },
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: { theme: 'light' },
	// next-themes persists the theme in localStorage; a story that toggles it (ThemeToggle) must not
	// leak its choice into the next story.
	beforeEach() {
		localStorage.removeItem('theme');
	},
	parameters: {
		a11y: {
			// Any axe violation fails the story's test. One that can't be fixed is skipped per story, for
			// that rule and element only (see .claude/rules/storybook.md), never with 'todo', which CI
			// ignores entirely.
			test: 'error',
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		nextjs: {
			// The app uses only the App Router.
			appDirectory: true,
		},
	},
	tags: ['autodocs'],
};

export default preview;
