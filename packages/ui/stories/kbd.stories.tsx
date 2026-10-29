import { Kbd, KbdGroup } from '@repo/ui/components/kbd';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * Shows a keyboard key or shortcut, such as Esc or Ctrl+K. Put several Kbd in a KbdGroup for a
 * combination. Inside TooltipContent it switches to colors that read on the tooltip. It's a
 * `<kbd>` that only displays keys; it binds nothing. Forwards native attributes.
 *
 * @summary Keyboard key or shortcut label
 */
const meta = {
	component: Kbd,
	subcomponents: { KbdGroup },
	args: { children: 'Esc' },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single key. */
export const Default: Story = {};

/** KbdGroup joins the keys of a shortcut. */
export const Shortcut: Story = {
	render: (args) => (
		<KbdGroup>
			<Kbd {...args}>Ctrl</Kbd>
			<Kbd {...args}>K</Kbd>
		</KbdGroup>
	),
};
