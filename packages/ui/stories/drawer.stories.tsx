import { Button } from '@repo/ui/components/button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@repo/ui/components/drawer';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen } from 'storybook/test';

/**
 * A panel that slides in and can be dragged closed, the touch-friendly choice on mobile (built on
 * vaul). Set `direction` on Drawer: `bottom` (default, with a drag handle), `top`, `left` or
 * `right`. Like Sheet it is a modal dialog: include a DrawerTitle. Takes vaul's props, such as
 * `open`, `onOpenChange` and `snapPoints`. On desktop, a Dialog or Sheet often reads better.
 *
 * @summary Draggable bottom (or side) panel for mobile, built on vaul
 */
const meta = {
	component: Drawer,
	subcomponents: {
		DrawerTrigger,
		DrawerContent,
		DrawerHeader,
		DrawerFooter,
		DrawerTitle,
		DrawerDescription,
		DrawerClose,
	},
	render: (args) => (
		<Drawer {...args}>
			<DrawerTrigger asChild>
				<Button variant="outline">Set goal</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Daily goal</DrawerTitle>
					<DrawerDescription>Set your daily activity goal.</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter>
					<Button>Save goal</Button>
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Set goal' }));
		await expect(await screen.findByRole('dialog', { name: 'Daily goal' })).toBeVisible();
	},
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** From the bottom, with the drag handle. */
export const Bottom: Story = {};

/** From the right, for a side panel. */
export const Right: Story = { args: { direction: 'right' } };
