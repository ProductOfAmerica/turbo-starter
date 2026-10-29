import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from '@repo/ui/components/bubble';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

/**
 * The surface of a chat message: a rounded bubble around its text or media. In a conversation,
 * put it inside a Message, which sits in a MessageScroller (shadcn's chat rules: no hand-rolled
 * bubble divs). `variant` is `default`, `secondary`, `muted`, `tinted`, `outline`, `ghost` or
 * `destructive`; `align` is `start` or `end` (usually the user's side). BubbleContent holds the
 * content; with `asChild` it renders as your own button or link, which then gets a hover style.
 * BubbleReactions pins reactions to a corner (`side`: `top` or `bottom`; `align`: `start` or
 * `end`). BubbleGroup stacks consecutive bubbles from one sender.
 *
 * @summary Chat message bubble with variants, alignment and reactions
 */
const meta = {
	component: Bubble,
	subcomponents: { BubbleContent, BubbleReactions, BubbleGroup },
	render: (args) => (
		<Bubble {...args}>
			<BubbleContent>Can you summarize the release notes?</BubbleContent>
		</Bubble>
	),
} satisfies Meta<typeof Bubble>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The primary fill. */
export const Default: Story = {};

/** `variant="secondary"`. */
export const Secondary: Story = { args: { variant: 'secondary' } };

/** `variant="muted"`, a common choice for the other party's messages. */
export const Muted: Story = { args: { variant: 'muted' } };

/** `variant="tinted"`, a light tint of the primary color. */
export const Tinted: Story = { args: { variant: 'tinted' } };

/** `variant="outline"`. */
export const Outline: Story = { args: { variant: 'outline' } };

/** `variant="ghost"`: no surface, full width, for long assistant replies. */
export const Ghost: Story = { args: { variant: 'ghost' } };

/** `variant="destructive"` for errors. */
export const Destructive: Story = {
	args: { variant: 'destructive' },
};

/** `align="end"` moves the bubble to the right. */
export const AlignEnd: Story = {
	args: { align: 'end' },
	render: (args) => (
		<div className="flex w-96 flex-col">
			<Bubble {...args}>
				<BubbleContent>Can you summarize the release notes?</BubbleContent>
			</Bubble>
		</div>
	),
};

/** BubbleReactions pins reactions to a corner of the bubble. */
export const WithReactions: Story = {
	args: { variant: 'muted' },
	render: (args) => (
		<Bubble {...args} className="mb-4">
			<BubbleContent>The release ships on Friday.</BubbleContent>
			<BubbleReactions>
				<span role="img" aria-label="Thumbs up">
					👍
				</span>
			</BubbleReactions>
		</Bubble>
	),
};

/** BubbleGroup stacks consecutive bubbles from the same sender. */
export const Group: Story = {
	args: { variant: 'muted' },
	render: (args) => (
		<BubbleGroup>
			<Bubble {...args}>
				<BubbleContent>The build passed.</BubbleContent>
			</Bubble>
			<Bubble {...args}>
				<BubbleContent>Deploying to preview now.</BubbleContent>
			</Bubble>
		</BubbleGroup>
	),
};

// The button's handler isn't a Bubble prop, so it can't be an arg; cleared before each run.
const sendReply = fn();

/** With `asChild`, BubbleContent can be a button, such as a suggested reply. */
export const AsButton: Story = {
	args: { variant: 'outline' },
	beforeEach() {
		sendReply.mockClear();
	},
	render: (args) => (
		<Bubble {...args}>
			<BubbleContent asChild>
				<button type="button" onClick={sendReply}>
					Summarize the changes
				</button>
			</BubbleContent>
		</Bubble>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Summarize the changes' }));
		await expect(sendReply).toHaveBeenCalledOnce();
	},
};
