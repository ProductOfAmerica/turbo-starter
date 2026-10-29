import { Button } from '@repo/ui/components/button';
import { Spinner } from '@repo/ui/components/spinner';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

/**
 * An animated loading indicator with role="status" and the label "Loading" (override it with
 * `aria-label`). Size it with `className` (`size-4` by default). In a Button, put it before the
 * text with `data-icon="inline-start"` and disable the button while the action runs. It's a lucide
 * icon, so it forwards SVG attributes.
 *
 * @summary Animated loading indicator with a status role
 */
const meta = {
	component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Announced as "Loading". */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('status', { name: 'Loading' })).toBeVisible();
	},
};

/** Sized with `className`. */
export const Large: Story = { args: { className: 'size-8' } };

/** In a disabled button while its action runs. */
export const InButton: Story = {
	render: (args) => (
		<Button disabled>
			<Spinner {...args} data-icon="inline-start" />
			Saving
		</Button>
	),
};
