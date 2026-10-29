import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/toggle-group';
import type { Meta, StoryObj } from '@storybook/react';
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, BoldIcon, ItalicIcon, UnderlineIcon } from 'lucide-react';
import { expect, fn } from 'storybook/test';

/**
 * A set of toggles where `type="single"` picks one value (like text alignment) and
 * `type="multiple"` picks any number (like bold and italic). Items inherit the group's `variant`
 * and `size`; `spacing` sets the gap and `orientation` the direction. Icon-only items need an
 * `aria-label`. Built on Radix ToggleGroup: `value`/`defaultValue` and `onValueChange`.
 *
 * @summary Group of toggles picking one value or several
 */
const meta = {
	component: ToggleGroup,
	subcomponents: { ToggleGroupItem },
	args: { type: 'single', 'aria-label': 'Text alignment', defaultValue: 'left' },
	render: (args) => (
		<ToggleGroup {...args}>
			<ToggleGroupItem value="left" aria-label="Align left">
				<AlignLeftIcon />
			</ToggleGroupItem>
			<ToggleGroupItem value="center" aria-label="Align center">
				<AlignCenterIcon />
			</ToggleGroupItem>
			<ToggleGroupItem value="right" aria-label="Align right">
				<AlignRightIcon />
			</ToggleGroupItem>
		</ToggleGroup>
	),
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `single`: choosing an item deselects the others. */
export const Single: Story = {
	args: { onValueChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('radio', { name: 'Align right' }));
		await expect(canvas.getByRole('radio', { name: 'Align right' })).toBeChecked();
		await expect(args.onValueChange).toHaveBeenCalledWith('right');
	},
};

/** `multiple`: each item toggles on its own. */
export const Multiple: Story = {
	args: { type: 'multiple', 'aria-label': 'Text style', defaultValue: ['bold'] },
	render: (args) => (
		<ToggleGroup {...args}>
			<ToggleGroupItem value="bold" aria-label="Bold">
				<BoldIcon />
			</ToggleGroupItem>
			<ToggleGroupItem value="italic" aria-label="Italic">
				<ItalicIcon />
			</ToggleGroupItem>
			<ToggleGroupItem value="underline" aria-label="Underline">
				<UnderlineIcon />
			</ToggleGroupItem>
		</ToggleGroup>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Italic' }));
		await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute('aria-pressed', 'true');
		await expect(canvas.getByRole('button', { name: 'Italic' })).toHaveAttribute('aria-pressed', 'true');
	},
};

/** The outline variant with no gap, so the items join into one segmented control. */
export const OutlineJoined: Story = { args: { variant: 'outline', spacing: 0 } };

/** The small size, for dense toolbars. */
export const Small: Story = { args: { size: 'sm' } };

/** A vertical group. */
export const Vertical: Story = { args: { orientation: 'vertical' } };
