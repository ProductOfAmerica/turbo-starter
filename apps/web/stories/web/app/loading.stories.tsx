import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Loading from '@/app/loading';

/**
 * The route loading state (app/loading.tsx): a spinner and "Loading...", which Next.js shows while
 * a page's server components render.
 *
 * @summary Route loading screen with a spinner
 */
const meta = {
	component: Loading,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A spinner and a text label. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Loading...')).toBeVisible();
	},
};
