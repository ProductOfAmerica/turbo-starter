import {
	ContextMenu,
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuGroup,
	ContextMenuItem,
	ContextMenuLabel,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuSeparator,
	ContextMenuShortcut,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger,
} from '@repo/ui/components/context-menu';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen } from 'storybook/test';

/**
 * A menu opened by right-clicking (or long-pressing) an area, such as a file in a list. Right-click
 * menus are hard to discover, so offer the same actions elsewhere (a DropdownMenu or buttons). The
 * parts mirror DropdownMenu: items with `inset` and `variant` (`default` or `destructive`), checkbox
 * and radio items, labels, separators, shortcuts and submenus. Built on Radix ContextMenu.
 *
 * @summary Right-click menu for an area; mirror its actions somewhere discoverable
 */
const meta = {
	component: ContextMenu,
	subcomponents: {
		ContextMenuTrigger,
		ContextMenuContent,
		ContextMenuItem,
		ContextMenuCheckboxItem,
		ContextMenuLabel,
		ContextMenuSeparator,
		ContextMenuShortcut,
		ContextMenuSub,
		ContextMenuSubTrigger,
		ContextMenuSubContent,
		ContextMenuGroup,
		ContextMenuRadioGroup,
		ContextMenuRadioItem,
	},
	render: (args) => (
		<ContextMenu {...args}>
			<ContextMenuTrigger className="flex h-36 w-72 items-center justify-center rounded-md border border-dashed text-sm">
				Right-click here
			</ContextMenuTrigger>
			<ContextMenuContent className="w-56">
				<ContextMenuLabel>File</ContextMenuLabel>
				<ContextMenuGroup>
					<ContextMenuItem>
						Rename
						<ContextMenuShortcut>F2</ContextMenuShortcut>
					</ContextMenuItem>
				</ContextMenuGroup>
				<ContextMenuCheckboxItem checked>Show hidden files</ContextMenuCheckboxItem>
				<ContextMenuSub>
					<ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
					<ContextMenuSubContent>
						<ContextMenuItem>Archive</ContextMenuItem>
						<ContextMenuItem>Shared</ContextMenuItem>
					</ContextMenuSubContent>
				</ContextMenuSub>
				<ContextMenuSeparator />
				<ContextMenuItem variant="destructive">Delete</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	),
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A right-click on the area opens the menu at the pointer. */
export const Open: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText('Right-click here') });
		await expect(await screen.findByRole('menu')).toBeVisible();
		await expect(screen.getByRole('menuitem', { name: /Rename/ })).toBeVisible();
	},
};

/** ContextMenuRadioGroup holds a single choice among ContextMenuRadioItems; the selected one is checked. */
export const RadioItems: Story = {
	render: (args) => (
		<ContextMenu {...args}>
			<ContextMenuTrigger className="flex h-36 w-72 items-center justify-center rounded-md border border-dashed text-sm">
				Right-click here
			</ContextMenuTrigger>
			<ContextMenuContent className="w-56">
				<ContextMenuLabel>Sort by</ContextMenuLabel>
				<ContextMenuRadioGroup value="name">
					<ContextMenuRadioItem value="name">Name</ContextMenuRadioItem>
					<ContextMenuRadioItem value="date">Date</ContextMenuRadioItem>
				</ContextMenuRadioGroup>
			</ContextMenuContent>
		</ContextMenu>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByText('Right-click here') });
		await expect(await screen.findByRole('menuitemradio', { name: 'Name' })).toBeChecked();
		await expect(screen.getByRole('menuitemradio', { name: 'Date' })).not.toBeChecked();
	},
};
