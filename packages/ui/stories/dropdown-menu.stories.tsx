import { Button } from '@repo/ui/components/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fn, screen } from 'storybook/test';

/**
 * A menu of actions or options opened from a button, rendered in a portal with full keyboard
 * support. Items run actions (`onSelect`); DropdownMenuCheckboxItem and DropdownMenuRadioItem hold
 * state; DropdownMenuSub nests a submenu. Items take `inset` (align with iconed items) and `variant`
 * (`default` or `destructive`). DropdownMenuShortcut shows a key hint (it doesn't bind the key).
 * For navigation menus use NavigationMenu; for a right-click menu use ContextMenu. Built on Radix.
 *
 * @summary Action menu from a button: items, checkbox and radio items, submenus
 */
const meta = {
	component: DropdownMenu,
	subcomponents: {
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuCheckboxItem,
		DropdownMenuRadioGroup,
		DropdownMenuRadioItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuShortcut,
		DropdownMenuGroup,
		DropdownMenuSub,
		DropdownMenuSubTrigger,
		DropdownMenuSubContent,
	},
	// a11y exception, aria-hidden-focus: while open, Radix hides everything outside the menu with
	// aria-hidden (marking it data-aria-hidden) and keeps focus inside it. axe excuses that only while
	// a dialog is open, and a menu isn't one. Only elements Radix hid that way are skipped.
	parameters: {
		a11y: {
			config: { rules: [{ id: 'aria-hidden-focus', selector: '[aria-hidden="true"]:not([data-aria-hidden])' }] },
		},
	},
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Account actions: a label, grouped items with shortcuts, and a destructive item. */
export const Default: Story = {
	args: { onOpenChange: fn() },
	render: (args) => (
		<DropdownMenu {...args}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">My account</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				<DropdownMenuLabel>Ada Lovelace</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						Profile
						<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						Settings
						<DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'My account' }));
		await expect(await screen.findByRole('menu')).toBeVisible();
		await expect(args.onOpenChange).toHaveBeenCalledWith(true);
	},
};

/** Choosing an item closes the menu. Put the item's action in its `onSelect`. */
export const SelectItem: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Actions</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>Duplicate</DropdownMenuItem>
				<DropdownMenuItem>Archive</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Actions' }));
		await userEvent.click(await screen.findByRole('menuitem', { name: 'Duplicate' }));
		await expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	},
};

function CheckboxMenu() {
	const [showStatusBar, setShowStatusBar] = useState(true);
	const [showPanel, setShowPanel] = useState(false);
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">View</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-48">
				<DropdownMenuCheckboxItem checked={showStatusBar} onCheckedChange={setShowStatusBar}>
					Status bar
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem checked={showPanel} onCheckedChange={setShowPanel}>
					Panel
				</DropdownMenuCheckboxItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** Checkbox items toggle settings without closing semantics changing. */
export const CheckboxItems: Story = {
	render: () => <CheckboxMenu />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'View' }));
		await expect(await screen.findByRole('menuitemcheckbox', { name: 'Status bar' })).toBeChecked();
	},
};

function RadioMenu() {
	const [position, setPosition] = useState('bottom');
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Panel position</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-48">
				<DropdownMenuLabel>Panel position</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
					<DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="right">Right</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

/** Radio items pick one value. */
export const RadioItems: Story = {
	render: () => <RadioMenu />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Panel position' }));
		await expect(await screen.findByRole('menuitemradio', { name: 'Bottom' })).toBeChecked();
	},
};

/** A submenu opens from DropdownMenuSubTrigger, with the arrow keys or the pointer. */
export const Submenu: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Share</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-48">
				<DropdownMenuItem>Copy link</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>Send to</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem>Email</DropdownMenuItem>
						<DropdownMenuItem>Messages</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Share' }));
		await userEvent.click(await screen.findByRole('menuitem', { name: 'Send to' }));
		await expect(await screen.findByRole('menuitem', { name: 'Email' })).toBeVisible();
	},
};
