import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import ErrorPage from '@/app/error';

/**
 * The route error boundary (app/error.tsx), shown when rendering a page throws. Next.js passes
 * the `error` and a `reset` function that retries the render; Try again calls `reset`.
 *
 * @summary Route error screen with a retry button
 */
const meta = {
	component: ErrorPage,
	args: { error: new Error('Failed to load') },
	// a11y exception, color-contrast: the large "Error" heading is text-muted-foreground/20, under 3:1
	// in both themes, by design. Only that h1 is skipped.
	parameters: {
		layout: 'fullscreen',
		a11y: { config: { rules: [{ id: 'color-contrast', selector: '*:not(h1)' }] } },
	},
} satisfies Meta<typeof ErrorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Try again calls `reset`. */
export const Default: Story = {
	args: { reset: fn() },
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
		await expect(args.reset).toHaveBeenCalledOnce();
	},
};
