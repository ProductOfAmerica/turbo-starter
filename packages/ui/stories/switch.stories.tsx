import { Label } from '@repo/ui/components/label';
import { Switch } from '@repo/ui/components/switch';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

/**
 * An on/off setting that takes effect immediately, such as enabling notifications. For a choice
 * applied when a form is submitted, use Checkbox. Give it a Label through `id` and `htmlFor`.
 * Built on Radix Switch: `checked`/`defaultChecked`, `onCheckedChange`, and `size` (`sm` or `default`).
 *
 * @summary Immediate on/off setting in two sizes
 */
const meta = {
	component: Switch,
	args: { id: 'airplane-mode' },
	render: (args) => (
		<div className="flex items-center gap-2">
			<Switch {...args} />
			<Label htmlFor={args.id}>Airplane mode</Label>
		</div>
	),
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Off until switched on. Clicking reports the new state. */
export const Default: Story = {
	args: { onCheckedChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		const toggle = canvas.getByRole('switch', { name: 'Airplane mode' });
		await userEvent.click(toggle);
		await expect(toggle).toBeChecked();
		await expect(args.onCheckedChange).toHaveBeenCalledWith(true);
	},
};

/** A setting that is already on. */
export const Checked: Story = { args: { defaultChecked: true } };

/** The small size, for dense lists and table rows. */
export const Small: Story = { args: { size: 'sm' } };

/** A setting the user can't change right now. */
export const Disabled: Story = {
	args: { disabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('switch')).toBeDisabled();
	},
};
