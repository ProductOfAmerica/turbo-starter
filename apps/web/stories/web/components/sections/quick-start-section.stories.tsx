import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { QuickStartSection } from '@/components/sections/quick-start-section';
import { commands } from '@/lib/constants';

/**
 * The home page's #quick-start section (Navbar links to it): install steps, the project layout,
 * and the commands from `commands` in lib/constants.tsx, each with a ClipboardButton. Takes no
 * props.
 *
 * @summary Home page install steps, project layout and copyable commands
 */
const meta = {
	component: QuickStartSection,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof QuickStartSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A copy button for every command. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { name: 'Get up and running' })).toBeVisible();
		for (const { cmd } of commands) {
			await expect(canvas.getByRole('button', { name: `Copy ${cmd} to clipboard` })).toBeVisible();
		}
	},
};
