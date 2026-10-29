import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor } from 'storybook/test';
import { ThemeToggle } from '@/components/theme-toggle';

/**
 * Switches between the light and dark themes through next-themes (the ThemeProvider in
 * app/layout.tsx), which saves the choice in localStorage. Until it mounts it renders an empty
 * button, so the server and client markup match. Navbar renders it; it takes no props.
 *
 * @summary Button that switches between the light and dark themes
 */
const meta = {
	component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clicking switches the theme on `<html>`, from whichever theme the story started in. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		const html = document.documentElement;
		const startedDark = html.classList.contains('dark');
		await userEvent.click(await canvas.findByRole('button', { name: 'Toggle theme' }));
		await waitFor(() => expect(html.classList.contains('dark')).toBe(!startedDark));
	},
};

/** Clicking twice returns to the starting theme, so the toggle works from dark back to light too. */
export const RoundTrip: Story = {
	tags: ['!manifest'],
	play: async ({ canvas, userEvent }) => {
		const html = document.documentElement;
		const startedDark = html.classList.contains('dark');
		const button = await canvas.findByRole('button', { name: 'Toggle theme' });
		await userEvent.click(button);
		await waitFor(() => expect(html.classList.contains('dark')).toBe(!startedDark));
		await userEvent.click(button);
		await waitFor(() => expect(html.classList.contains('dark')).toBe(startedDark));
	},
};
