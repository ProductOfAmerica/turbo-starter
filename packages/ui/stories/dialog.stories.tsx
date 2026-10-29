import { Button } from '@repo/ui/components/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, waitFor } from 'storybook/test';

/**
 * A modal window for a focused task that needs the user's attention, such as editing a record.
 * It renders in a portal, traps focus, and closes on Escape or a click outside. Always include a
 * DialogTitle (and usually a DialogDescription) so screen readers announce it. For confirming a
 * destructive action use AlertDialog; for side panels use Sheet. DialogContent shows a close button
 * unless `showCloseButton={false}`; DialogFooter can add a Close button with `showCloseButton`.
 * Built on Radix Dialog: `open`, `defaultOpen` and `onOpenChange`.
 *
 * @summary Modal window for a focused task; renders in a portal and traps focus
 */
const meta = {
	component: Dialog,
	subcomponents: {
		DialogTrigger,
		DialogContent,
		DialogHeader,
		DialogFooter,
		DialogTitle,
		DialogDescription,
		DialogClose,
	},
	render: (args) => (
		<Dialog {...args}>
			<DialogTrigger asChild>
				<Button variant="outline">Edit profile</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>Changes are saved when you press Save.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2">
					<Label htmlFor="display-name">Display name</Label>
					<Input id="display-name" defaultValue="Ada Lovelace" />
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<Button type="submit">Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opening the dialog announces its title and moves focus inside. */
export const Open: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }));
		const dialog = await screen.findByRole('dialog', { name: 'Edit profile' });
		await expect(dialog).toHaveAccessibleDescription('Changes are saved when you press Save.');
		await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
	},
};

/** Escape closes it and returns focus to the trigger. */
export const ClosesWithEscape: Story = {
	tags: ['!manifest'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Edit profile' });
		await userEvent.click(trigger);
		await screen.findByRole('dialog');
		await userEvent.keyboard('{Escape}');
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
		await expect(trigger).toHaveFocus();
	},
};

/** The corner close button has the accessible name "Close". */
export const CloseButton: Story = {
	tags: ['!manifest'],
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }));
		await userEvent.click(await screen.findByRole('button', { name: 'Close' }));
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	},
};

/** `showCloseButton` on DialogFooter adds a Close button next to the actions. */
export const FooterCloseButton: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Edit profile</Button>
			</DialogTrigger>
			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>Changes are saved when you press Save.</DialogDescription>
				</DialogHeader>
				<DialogFooter showCloseButton>
					<Button type="submit">Save</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Edit profile' }));
		await userEvent.click(await screen.findByRole('button', { name: 'Close' }));
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	},
};
