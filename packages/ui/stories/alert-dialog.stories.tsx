import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog';
import { Button } from '@repo/ui/components/button';
import type { Meta, StoryObj } from '@storybook/react';
import { TriangleAlertIcon } from 'lucide-react';
import { expect, fn, screen, waitFor } from 'storybook/test';

/**
 * A modal that asks the user to confirm before something happens, usually something irreversible.
 * Unlike Dialog it does not close on a click outside: the user must choose AlertDialogAction or
 * AlertDialogCancel (Escape cancels). Include an AlertDialogTitle and AlertDialogDescription that
 * say what will happen. AlertDialogContent takes `size` (`default` or `sm`); AlertDialogMedia holds
 * an icon; Action and Cancel take Button's `variant` and `size`. Built on Radix AlertDialog.
 *
 * @summary Confirmation modal before an irreversible action
 */
const meta = {
	component: AlertDialog,
	subcomponents: {
		AlertDialogTrigger,
		AlertDialogContent,
		AlertDialogHeader,
		AlertDialogFooter,
		AlertDialogMedia,
		AlertDialogTitle,
		AlertDialogDescription,
		AlertDialogAction,
		AlertDialogCancel,
	},
	render: (args) => (
		<AlertDialog {...args}>
			<AlertDialogTrigger asChild>
				<Button variant="outline">Delete project</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete this project?</AlertDialogTitle>
					<AlertDialogDescription>
						This permanently deletes the project and its deployments. You can't undo this.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Delete</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The confirmation, open. */
export const Open: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Delete project' }));
		await expect(await screen.findByRole('alertdialog', { name: 'Delete this project?' })).toBeVisible();
	},
};

/** Cancel closes it without acting; `onOpenChange` reports the close. */
export const Cancelled: Story = {
	args: { onOpenChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Delete project' }));
		await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
		await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
	},
};

/** The small size with an icon in AlertDialogMedia, for short confirmations. */
export const SmallWithMedia: Story = {
	render: (args) => (
		<AlertDialog {...args} defaultOpen>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogMedia>
						<TriangleAlertIcon />
					</AlertDialogMedia>
					<AlertDialogTitle>Discard changes?</AlertDialogTitle>
					<AlertDialogDescription>Your edits haven't been saved.</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Keep editing</AlertDialogCancel>
					<AlertDialogAction>Discard</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
};
