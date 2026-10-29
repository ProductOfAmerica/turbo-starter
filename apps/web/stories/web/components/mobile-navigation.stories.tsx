import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, screen, waitFor, within } from 'storybook/test';
import { MobileNavigation } from '@/components/mobile-navigation';

/**
 * The menu button and slide-in Sheet that hold the site links below the md breakpoint; it hides
 * itself from md up. Choosing a link closes the sheet. Navbar renders it; it takes no props.
 *
 * @summary Mobile menu: a sheet of site links behind a menu button
 */
const meta = {
	component: MobileNavigation,
	globals: { viewport: { value: 'mobile1' } },
} satisfies Meta<typeof MobileNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The menu button, closed. */
export const Closed: Story = {};

/** The button opens the sheet of links. */
export const Open: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Toggle menu' }));
		const sheet = await screen.findByRole('dialog', { name: 'Navigation' });
		await expect(within(sheet).getByRole('link', { name: 'Features' })).toBeVisible();
		await expect(within(sheet).getByRole('link', { name: 'GitHub' })).toHaveAttribute('target', '_blank');
	},
};

/** Choosing a link closes the sheet. */
export const LinkClosesMenu: Story = {
	tags: ['!manifest'],
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Toggle menu' }));
		const sheet = await screen.findByRole('dialog', { name: 'Navigation' });
		await userEvent.click(within(sheet).getByRole('link', { name: 'Quick Start' }));
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	},
};
