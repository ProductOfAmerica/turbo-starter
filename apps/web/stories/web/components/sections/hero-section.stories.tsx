import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { HeroSection } from '@/components/sections/hero-section';

/**
 * The home page's opening section: a release badge, the headline, the Get Started and Read
 * Documentation links, and badges for the tech stack (`techStack` in lib/constants.tsx). Takes no
 * props.
 *
 * @summary Home page hero: headline, primary links and tech stack badges
 */
const meta = {
	component: HeroSection,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The page's only h1, with links that open in a new tab. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { level: 1, name: /Build faster with/ })).toBeVisible();
		await expect(canvas.getByRole('link', { name: 'Get Started' })).toHaveAttribute('target', '_blank');
	},
};
