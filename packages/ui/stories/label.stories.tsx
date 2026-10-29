import { Checkbox } from '@repo/ui/components/checkbox';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

/**
 * Names a form control. Set `htmlFor` to the control's `id` (or wrap the control), so clicking the
 * label focuses or toggles it. Inside a Field use FieldLabel instead, which adds layout. Forwards
 * every native `<label>` attribute.
 *
 * @summary Accessible name for a form control; clicking it activates the control
 */
const meta = {
	component: Label,
	args: { htmlFor: 'name', children: 'Full name' },
	render: (args) => (
		<div className="grid w-72 gap-2">
			<Label {...args} />
			<Input id="name" placeholder="Ada Lovelace" />
		</div>
	),
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clicking the label focuses its input. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByText('Full name'));
		await expect(canvas.getByLabelText('Full name')).toHaveFocus();
	},
};

/** Next to a checkbox, clicking the label toggles it. */
export const WithCheckbox: Story = {
	args: { htmlFor: 'terms', children: 'Accept the terms' },
	render: (args) => (
		<div className="flex items-center gap-2">
			<Checkbox id="terms" />
			<Label {...args} />
		</div>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByText('Accept the terms'));
		await expect(canvas.getByRole('checkbox', { name: 'Accept the terms' })).toBeChecked();
	},
};
