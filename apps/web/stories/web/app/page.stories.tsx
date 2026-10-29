import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import Home from '@/app/page';

/**
 * The home page (app/page.tsx): Navbar, then HeroSection, FeaturesSection, QuickStartSection and
 * CTASection inside `<main>`, then Footer, over a fixed decorative background. To change a part,
 * edit its section in components/sections.
 *
 * @summary The whole home page, composed from the section components
 */
const meta = {
	component: Home,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Home>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every section, in order, with one main landmark and one h1. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('main')).toBeVisible();
		await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1);
	},
};
