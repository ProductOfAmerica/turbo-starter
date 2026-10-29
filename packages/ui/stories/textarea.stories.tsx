import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

/**
 * Multi-line text entry that grows with its content (CSS `field-sizing: content`). Pair it with a
 * Label, or compose it inside a Field for help text and errors. Forwards every native `<textarea>`
 * attribute, such as `rows`, `maxLength`, `value`, `onChange` and `disabled`.
 *
 * @summary Auto-growing multi-line text entry; pair with Label or Field
 */
const meta = {
	component: Textarea,
	args: { id: 'bio', placeholder: 'Tell us about yourself' },
	render: (args) => (
		<div className="grid w-80 gap-2">
			<Label htmlFor={args.id}>Bio</Label>
			<Textarea {...args} />
		</div>
	),
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A labelled textarea. */
export const Default: Story = {
	args: { onChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		const textarea = canvas.getByLabelText('Bio');
		await userEvent.type(textarea, 'Building design systems.');
		await expect(textarea).toHaveValue('Building design systems.');
		await expect(args.onChange).toHaveBeenCalled();
	},
};

/** A textarea the user can't edit right now. */
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Read-only for now.' } };

/** `aria-invalid` marks it as failing validation; explain the error in text too. */
export const Invalid: Story = { args: { 'aria-invalid': true, defaultValue: 'Too short' } };
