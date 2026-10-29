import { Progress } from '@repo/ui/components/progress';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

/**
 * A bar showing how far a task has got, such as an upload. Set `value` from 0 to 100, give it an
 * `aria-label`, and size it with `className`. This wrapper doesn't pass `value` on to Radix, so
 * assistive tech reads an indeterminate progress bar with no current value; only the bar's fill
 * shows it. Built on Radix Progress.
 *
 * @summary Horizontal bar showing a task's progress from 0 to 100
 */
const meta = {
	component: Progress,
	args: { value: 60, 'aria-label': 'Upload progress', className: 'w-72' },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 60 percent done. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('progressbar', { name: 'Upload progress' })).toBeVisible();
	},
};

/** Not started. */
export const Empty: Story = { args: { value: 0 } };

/** Done. */
export const Complete: Story = { args: { value: 100 } };
