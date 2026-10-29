import { DirectionProvider, useDirection } from '@repo/ui/components/direction';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

function CurrentDirection() {
	const direction = useDirection();

	return <p data-testid="direction">Direction: {direction}</p>;
}

/**
 * Sets the reading direction (`ltr` or `rtl`) for every Radix-based component below it, so menus,
 * sliders, tabs and popovers open and move the right way in right-to-left languages. Pass `dir`
 * (or its alias `direction`) and your content; set the same value as the `dir` attribute on the
 * surrounding element so the layout flips too. `useDirection` reads the value in any descendant.
 * Wrap the app once, near the root.
 *
 * @summary Provides ltr or rtl direction to Radix components
 */
const meta = {
	component: DirectionProvider,
	args: { dir: 'ltr', children: null },
	render: (args) => (
		<div dir={args.dir ?? args.direction}>
			<DirectionProvider {...args}>
				<CurrentDirection />
			</DirectionProvider>
		</div>
	),
} satisfies Meta<typeof DirectionProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `dir="ltr"`: descendants read `ltr` from useDirection. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByTestId('direction')).toHaveTextContent('Direction: ltr');
	},
};

/** `dir="rtl"` for right-to-left languages such as Arabic and Hebrew. */
export const RightToLeft: Story = {
	args: { dir: 'rtl' },
	play: async ({ canvas }) => {
		await expect(canvas.getByTestId('direction')).toHaveTextContent('Direction: rtl');
	},
};

/** `direction` is an alias for `dir` and takes precedence when both are set. */
export const DirectionAlias: Story = {
	tags: ['!manifest'],
	args: { dir: 'ltr', direction: 'rtl' },
	play: async ({ canvas }) => {
		await expect(canvas.getByTestId('direction')).toHaveTextContent('Direction: rtl');
	},
};
