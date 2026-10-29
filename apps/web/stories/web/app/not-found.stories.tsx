import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import NotFound from '@/app/not-found';

/**
 * The 404 page (app/not-found.tsx), shown for unknown routes and `notFound()` calls, with a link
 * back to the home page.
 *
 * @summary 404 page with a link home
 */
const meta = {
	component: NotFound,
	// a11y exception, color-contrast: the large "404" heading is text-muted-foreground/20, under 3:1
	// in both themes, by design. Only that h1 is skipped.
	parameters: {
		layout: 'fullscreen',
		a11y: { config: { rules: [{ id: 'color-contrast', selector: '*:not(h1)' }] } },
	},
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The link goes home. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { name: 'Page not found' })).toBeVisible();
		await expect(canvas.getByRole('link', { name: 'Back to Home' })).toHaveAttribute('href', '/');
	},
};
