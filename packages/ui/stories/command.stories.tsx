import { Button } from '@repo/ui/components/button';
import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from '@repo/ui/components/command';
import type { Meta, StoryObj } from '@storybook/react';
import { CalculatorIcon, CalendarIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { expect, screen } from 'storybook/test';

function CommandItems() {
	return (
		<>
			<CommandInput placeholder="Type a command or search" />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem>
						<CalendarIcon />
						Calendar
					</CommandItem>
					<CommandItem>
						<CalculatorIcon />
						Calculator
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Settings">
					<CommandItem>
						<UserIcon />
						Profile
						<CommandShortcut>⌘P</CommandShortcut>
					</CommandItem>
					<CommandItem>
						<SettingsIcon />
						Settings
						<CommandShortcut>⌘S</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</>
	);
}

/**
 * A searchable list of commands, filtered as you type (built on cmdk). Render it inline, or use
 * CommandDialog for a command palette opened with a shortcut. Give Command a `label` for screen
 * readers. CommandGroup takes a `heading`; CommandItem fires `onSelect`; CommandEmpty shows when
 * nothing matches; CommandShortcut shows a key hint. CommandDialog takes Dialog's `open` and
 * `onOpenChange` plus `title` and `description` (read by screen readers, not shown).
 *
 * @summary Filterable command list or command palette (cmdk)
 */
const meta = {
	component: Command,
	subcomponents: {
		CommandDialog,
		CommandInput,
		CommandList,
		CommandEmpty,
		CommandGroup,
		CommandItem,
		CommandSeparator,
		CommandShortcut,
	},
	args: { label: 'Command menu', className: 'w-80 rounded-lg border shadow-md' },
	render: (args) => (
		<Command {...args}>
			<CommandItems />
		</Command>
	),
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Inline: typing filters the items across groups. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole('combobox'), 'calc');
		await expect(canvas.getByRole('option', { name: 'Calculator' })).toBeVisible();
		await expect(canvas.queryByRole('option', { name: 'Calendar' })).not.toBeInTheDocument();
	},
};

/** No match shows CommandEmpty. */
export const NoResults: Story = {
	// a11y exception, aria-required-children: cmdk leaves its role="listbox" list empty when nothing
	// matches. Only the list is skipped; [role] is the rule's own selector.
	parameters: {
		a11y: { config: { rules: [{ id: 'aria-required-children', selector: '[role]:not([cmdk-list])' }] } },
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.type(canvas.getByRole('combobox'), 'zzz');
		await expect(canvas.getByText('No results found.')).toBeVisible();
	},
};

function Palette() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)}>
				Open command palette
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<Command label="Command palette">
					<CommandItems />
				</Command>
			</CommandDialog>
		</>
	);
}

/** CommandDialog shows the list as a modal palette; wire it to a shortcut such as ⌘K in the app. */
export const PaletteDialog: Story = {
	// a11y exception, aria-required-children: cmdk renders CommandSeparator inside its role="listbox"
	// list, where only options and groups are allowed. Only the list is skipped; [role] is the rule's
	// own selector.
	parameters: {
		a11y: { config: { rules: [{ id: 'aria-required-children', selector: '[role]:not([cmdk-list])' }] } },
	},
	render: () => <Palette />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Open command palette' }));
		await expect(await screen.findByRole('dialog')).toBeVisible();
		await expect(screen.getByRole('option', { name: 'Calendar' })).toBeVisible();
	},
};
