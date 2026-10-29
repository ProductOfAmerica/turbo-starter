import { Slider } from '@repo/ui/components/slider';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';

/**
 * Picks a number, or a range with two thumbs, by dragging or with the arrow keys. Values are arrays:
 * pass one number for a single thumb, two for a range. Give it an `aria-label`. Built on Radix
 * Slider: `min` (default 0), `max` (default 100), `step`, `orientation` and `onValueChange`.
 *
 * @summary Numeric value or range picker; values are arrays
 */
const meta = {
	component: Slider,
	args: { 'aria-label': 'Volume', defaultValue: [50], className: 'w-72' },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One thumb. The arrow keys move it by `step`. */
export const Default: Story = {
	args: { onValueChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		const thumb = canvas.getByRole('slider');
		thumb.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect(thumb).toHaveAttribute('aria-valuenow', '51');
		await expect(args.onValueChange).toHaveBeenCalledWith([51]);
	},
};

/** Two values make a range with two thumbs, such as a price filter. */
export const Range: Story = {
	args: { 'aria-label': 'Price range', defaultValue: [20, 80] },
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('slider')).toHaveLength(2);
	},
};

/** `step` snaps the value to increments. */
export const Stepped: Story = { args: { defaultValue: [40], step: 20 } };

/** A slider the user can't move right now. */
export const Disabled: Story = { args: { disabled: true } };

/** A vertical slider needs a height. */
export const Vertical: Story = { args: { orientation: 'vertical', className: 'h-40' } };

function ControlledSlider() {
	const [value, setValue] = useState([30]);
	return (
		<>
			<Slider aria-label="Brightness" value={value} onValueChange={setValue} className="w-72" />
			<output className="mt-2 block text-sm">{value[0]}%</output>
		</>
	);
}

/**
 * Controlled with `value` and `onValueChange`, for a value another part of the UI also shows.
 *
 * @summary Controlled with `value` and `onValueChange`
 */
export const Controlled: Story = {
	render: () => <ControlledSlider />,
	play: async ({ canvas, userEvent }) => {
		canvas.getByRole('slider').focus();
		await userEvent.keyboard('{ArrowRight}{ArrowRight}');
		await expect(canvas.getByText('32%')).toBeVisible();
	},
};
