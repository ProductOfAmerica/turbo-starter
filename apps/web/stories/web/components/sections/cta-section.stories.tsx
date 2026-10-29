import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { CTASection } from '@/components/sections/cta-section';

/**
 * The home page's closing call to action: a heading and the Clone Repository and Deploy to Vercel
 * links, which open in a new tab. Takes no props.
 *
 * @summary Home page call to action with clone and deploy links
 */
const meta = {
	component: CTASection,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CTASection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two outbound links. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Clone Repository' })).toHaveAttribute('target', '_blank');
		await expect(canvas.getByRole('link', { name: 'Deploy to Vercel' })).toBeVisible();
	},
};
