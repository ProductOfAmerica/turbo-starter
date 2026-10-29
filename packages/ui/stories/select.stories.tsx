import { Label } from '@repo/ui/components/label';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from '@repo/ui/components/select';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, screen } from 'storybook/test';

/**
 * A custom dropdown for picking one value from a list, rendered in a portal. Compose Select >
 * SelectTrigger (with SelectValue) > SelectContent > SelectItem, and label the trigger with a Label
 * through `id`. Use NativeSelect on mobile or in plain forms, and Combobox when the list needs
 * search. Built on Radix Select: `value`/`defaultValue`, `onValueChange`, `disabled`. SelectTrigger
 * takes `size` (`sm` or `default`); SelectContent takes `position` (`item-aligned` or `popper`).
 *
 * @summary Dropdown single-select in a portal; use NativeSelect on mobile, Combobox for search
 */
const meta = {
	component: Select,
	subcomponents: { SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator },
	render: (args) => (
		<div className="grid w-56 gap-2">
			<Label htmlFor="fruit">Fruit</Label>
			<Select {...args}>
				<SelectTrigger id="fruit">
					<SelectValue placeholder="Pick a fruit" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="apple">Apple</SelectItem>
					<SelectItem value="banana">Banana</SelectItem>
					<SelectItem value="cherry">Cherry</SelectItem>
				</SelectContent>
			</Select>
		</div>
	),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opening the trigger shows the options in a portal; picking one shows it in the trigger. */
export const Default: Story = {
	args: { onValueChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('combobox', { name: 'Fruit' }));
		await userEvent.click(await screen.findByRole('option', { name: 'Banana' }));
		await expect(args.onValueChange).toHaveBeenCalledWith('banana');
		await expect(canvas.getByRole('combobox', { name: 'Fruit' })).toHaveTextContent('Banana');
	},
};

/** The open list, so its styles are checked in both themes. */
export const Open: Story = {
	args: { defaultValue: 'apple' },
	// a11y exception, aria-hidden-focus: while open, Radix hides everything outside the list with
	// aria-hidden (marking it data-aria-hidden) and keeps focus inside it. axe excuses that only while
	// a dialog is open, and a listbox isn't one. Only elements Radix hid that way are skipped.
	parameters: {
		a11y: {
			config: { rules: [{ id: 'aria-hidden-focus', selector: '[aria-hidden="true"]:not([data-aria-hidden])' }] },
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('combobox', { name: 'Fruit' }));
		await expect(await screen.findByRole('listbox')).toBeVisible();
	},
};

/** SelectGroup and SelectLabel structure a long list; SelectSeparator divides groups. */
export const Grouped: Story = {
	render: (args) => (
		<div className="grid w-56 gap-2">
			<Label htmlFor="timezone">Time zone</Label>
			<Select {...args}>
				<SelectTrigger id="timezone">
					<SelectValue placeholder="Pick a time zone" />
				</SelectTrigger>
				<SelectContent position="popper">
					<SelectGroup>
						<SelectLabel>North America</SelectLabel>
						<SelectItem value="est">Eastern</SelectItem>
						<SelectItem value="pst">Pacific</SelectItem>
					</SelectGroup>
					<SelectSeparator />
					<SelectGroup>
						<SelectLabel>Europe</SelectLabel>
						<SelectItem value="cet">Central European</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>
	),
};

/** A select the user can't change right now. */
export const Disabled: Story = {
	args: { disabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('combobox', { name: 'Fruit' })).toBeDisabled();
	},
};
