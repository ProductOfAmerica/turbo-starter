import { Label } from '@repo/ui/components/label';
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '@repo/ui/components/native-select';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

/**
 * The browser's own `<select>`, styled to match. Prefer it over Select on mobile, in long forms, and
 * whenever native behavior matters (form submission, autofill, OS pickers). Children are
 * NativeSelectOption and NativeSelectOptGroup. Forwards every native `<select>` attribute except
 * `size`, which here is `sm` or `default`.
 *
 * @summary Styled native select; best for mobile and plain forms
 */
const meta = {
	component: NativeSelect,
	subcomponents: { NativeSelectOption, NativeSelectOptGroup },
	args: { id: 'country', defaultValue: 'us' },
	render: (args) => (
		<div className="grid w-64 gap-2">
			<Label htmlFor={args.id}>Country</Label>
			<NativeSelect {...args}>
				<NativeSelectOption value="us">United States</NativeSelectOption>
				<NativeSelectOption value="ca">Canada</NativeSelectOption>
				<NativeSelectOption value="mx">Mexico</NativeSelectOption>
			</NativeSelect>
		</div>
	),
} satisfies Meta<typeof NativeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Choosing an option fires `onChange` like any `<select>`. */
export const Default: Story = {
	args: { onChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.selectOptions(canvas.getByLabelText('Country'), 'ca');
		await expect(canvas.getByLabelText('Country')).toHaveValue('ca');
		await expect(args.onChange).toHaveBeenCalled();
	},
};

/** NativeSelectOptGroup labels groups of options. */
export const Grouped: Story = {
	args: { id: 'timezone', defaultValue: 'est' },
	render: (args) => (
		<div className="grid w-64 gap-2">
			<Label htmlFor={args.id}>Time zone</Label>
			<NativeSelect {...args}>
				<NativeSelectOptGroup label="North America">
					<NativeSelectOption value="est">Eastern</NativeSelectOption>
					<NativeSelectOption value="pst">Pacific</NativeSelectOption>
				</NativeSelectOptGroup>
				<NativeSelectOptGroup label="Europe">
					<NativeSelectOption value="cet">Central European</NativeSelectOption>
				</NativeSelectOptGroup>
			</NativeSelect>
		</div>
	),
};

/** The small size. */
export const Small: Story = { args: { size: 'sm' } };

/** A select the user can't change right now. */
export const Disabled: Story = { args: { disabled: true } };
