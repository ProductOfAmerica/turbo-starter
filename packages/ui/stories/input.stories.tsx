import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

/**
 * Single-line text entry. Always pair it with a Label (or an `aria-label`); for a label, help text
 * and an error message together, compose it inside a Field. Forwards every native `<input>`
 * attribute, such as `type`, `name`, `value`, `onChange`, `disabled` and `aria-invalid`.
 *
 * @summary Native text input with design-system styling; pair with Label or Field
 */
const meta = {
	component: Input,
	args: { id: 'email', type: 'email', placeholder: 'you@example.com' },
	render: (args) => (
		<div className="grid w-72 gap-2">
			<Label htmlFor={args.id}>Email</Label>
			<Input {...args} />
		</div>
	),
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A labelled email field. */
export const Default: Story = {
	args: { onChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		const input = canvas.getByLabelText('Email');
		await userEvent.type(input, 'ada@example.com');
		await expect(input).toHaveValue('ada@example.com');
		await expect(args.onChange).toHaveBeenCalled();
	},
};

/** A field the user can't edit right now. */
export const Disabled: Story = {
	args: { disabled: true, defaultValue: 'ada@example.com' },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Email')).toBeDisabled();
	},
};

/** `aria-invalid` turns the border and focus ring destructive. Explain the error in text too (see Field). */
export const Invalid: Story = {
	args: { 'aria-invalid': true, defaultValue: 'ada@' },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
	},
};

/** `type="file"` styles the native file picker button. */
export const File: Story = {
	args: { id: 'avatar', type: 'file', placeholder: undefined },
	render: (args) => (
		<div className="grid w-72 gap-2">
			<Label htmlFor={args.id}>Avatar</Label>
			<Input {...args} />
		</div>
	),
};
