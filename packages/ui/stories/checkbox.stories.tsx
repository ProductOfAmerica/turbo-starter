import { Checkbox } from '@repo/ui/components/checkbox';
import { Label } from '@repo/ui/components/label';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

/**
 * A two-state (or indeterminate) choice that is applied on submit. Give it a Label through `id`
 * and `htmlFor`. For a setting that takes effect immediately, use Switch. Built on Radix Checkbox:
 * `checked` takes `true`, `false` or `'indeterminate'`, and `onCheckedChange` reports the new state.
 *
 * @summary Checkbox for opt-ins and multi-select lists; supports indeterminate
 */
const meta = {
	component: Checkbox,
	args: { id: 'terms' },
	render: (args) => (
		<div className="flex items-center gap-2">
			<Checkbox {...args} />
			<Label htmlFor={args.id}>Accept the terms and conditions</Label>
		</div>
	),
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Unchecked until the user opts in. Clicking it reports the new state. */
export const Default: Story = {
	args: { onCheckedChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		const checkbox = canvas.getByRole('checkbox', { name: 'Accept the terms and conditions' });
		await userEvent.click(checkbox);
		await expect(checkbox).toBeChecked();
		await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
	},
};

/** Already checked, for example a saved preference. */
export const Checked: Story = { args: { defaultChecked: true } };

/** `'indeterminate'` on a parent checkbox whose children are partly selected. */
export const Indeterminate: Story = {
	args: { checked: 'indeterminate' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
	},
};

/** A choice the user can't change right now. */
export const Disabled: Story = {
	args: { disabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('checkbox')).toBeDisabled();
	},
};

/** `aria-invalid` turns the border destructive when a required box is left unchecked. */
export const Invalid: Story = { args: { 'aria-invalid': true } };
