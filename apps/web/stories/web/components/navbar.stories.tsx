import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Navbar } from '@/components/navbar';

/**
 * The site header, sticky at the top of the home page: the project link, in-page links to Features
 * and Quick Start, and the ThemeToggle. Below the md breakpoint the in-page links move into
 * MobileNavigation's menu. Takes no props; the links live in navbar.tsx and mobile-navigation.tsx.
 *
 * @summary Sticky site header with in-page links and the theme toggle
 */
const meta = {
	component: Navbar,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** From the md breakpoint up, the links sit in the header. */
export const Desktop: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '#features');
		await expect(await canvas.findByRole('button', { name: 'Toggle theme' })).toBeVisible();
	},
};

/** Below md, a menu button replaces the links. */
export const Mobile: Story = {
	globals: { viewport: { value: 'mobile1' } },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Toggle menu' })).toBeVisible();
		await expect(canvas.queryByRole('link', { name: 'Features' })).not.toBeInTheDocument();
	},
};
