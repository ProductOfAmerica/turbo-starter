import { Toggle } from '@repo/ui/components/toggle';
import type { Meta, StoryObj } from '@storybook/react';
import { BoldIcon, ItalicIcon } from 'lucide-react';
import { expect, fn } from 'storybook/test';

/**
 * A button that stays pressed, such as bold in a text toolbar. For several related toggles use
 * ToggleGroup. Icon-only toggles need an `aria-label`. Built on Radix Toggle: `pressed`,
 * `defaultPressed` and `onPressedChange`; `variant` is `default` or `outline`, `size` is `sm`,
 * `default` or `lg`.
 *
 * @summary Pressable on/off button, as in a formatting toolbar
 */
const meta = {
	component: Toggle,
	args: { 'aria-label': 'Toggle bold', children: <BoldIcon /> },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pressing it flips `aria-pressed` and reports the new state. */
export const Default: Story = {
	args: { onPressedChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Toggle bold' });
		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');
		await expect(args.onPressedChange).toHaveBeenCalledWith(true);
	},
};

/** The outline variant, for toggles that sit outside a toolbar. */
export const Outline: Story = { args: { variant: 'outline' } };

/** Toggles can hold text, with or without an icon. */
export const WithText: Story = {
	args: {
		'aria-label': undefined,
		children: (
			<>
				<ItalicIcon data-icon="inline-start" />
				Italic
			</>
		),
	},
};

/** The sizes: `sm`, `default` and `lg`. */
export const Sizes: Story = {
	render: (args) => (
		<div className="flex items-center gap-2">
			<Toggle {...args} size="sm" />
			<Toggle {...args} size="default" />
			<Toggle {...args} size="lg" />
		</div>
	),
};

/** A toggle the user can't change right now. */
export const Disabled: Story = { args: { disabled: true } };
