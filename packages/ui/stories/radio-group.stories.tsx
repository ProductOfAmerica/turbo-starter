import { Label } from '@repo/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@repo/ui/components/radio-group';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

/**
 * One choice out of a short, visible list. Give the group an `aria-label` (or wrap it in a FieldSet
 * with a legend) and each RadioGroupItem a Label. For long lists use Select; for picking several,
 * use Checkboxes. Built on Radix RadioGroup: `value`/`defaultValue` and `onValueChange`.
 *
 * @summary Single choice from a short visible list
 */
const meta = {
	component: RadioGroup,
	subcomponents: { RadioGroupItem },
	args: { 'aria-label': 'Notification frequency', defaultValue: 'daily' },
	render: (args) => (
		<RadioGroup {...args}>
			{['Realtime', 'Daily', 'Weekly'].map((option) => (
				<div key={option} className="flex items-center gap-2">
					<RadioGroupItem value={option.toLowerCase()} id={`frequency-${option}`} />
					<Label htmlFor={`frequency-${option}`}>{option}</Label>
				</div>
			))}
		</RadioGroup>
	),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Choosing an option reports its value. */
export const Default: Story = {
	args: { onValueChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('radio', { name: 'Weekly' }));
		await expect(canvas.getByRole('radio', { name: 'Weekly' })).toBeChecked();
		await expect(args.onValueChange).toHaveBeenCalledWith('weekly');
	},
};

/** Arrow keys move focus between options, and Space selects the focused one. */
export const KeyboardNavigation: Story = {
	tags: ['!manifest'],
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('radio', { name: 'Daily' }));
		await userEvent.keyboard('{ArrowDown}');
		await expect(canvas.getByRole('radio', { name: 'Weekly' })).toHaveFocus();
		await userEvent.keyboard(' ');
		await expect(canvas.getByRole('radio', { name: 'Weekly' })).toBeChecked();
	},
};

/** A group the user can't change right now. */
export const Disabled: Story = { args: { disabled: true } };
