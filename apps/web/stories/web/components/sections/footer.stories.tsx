import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Footer } from '@/components/sections/footer';

/**
 * The site footer: links to Turborepo, Next.js and shadcn/ui, and the author credit. Takes no
 * props.
 *
 * @summary Site footer with project links and credit
 */
const meta = {
	component: Footer,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A contentinfo landmark with outbound links. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('contentinfo')).toBeVisible();
		await expect(canvas.getByRole('link', { name: 'Next.js' })).toHaveAttribute('href', 'https://nextjs.org');
	},
};
