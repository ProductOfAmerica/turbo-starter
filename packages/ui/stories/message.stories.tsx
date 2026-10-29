import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar';
import { Bubble, BubbleContent } from '@repo/ui/components/bubble';
import {
	Message,
	MessageAvatar,
	MessageContent,
	MessageFooter,
	MessageGroup,
	MessageHeader,
} from '@repo/ui/components/message';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

/**
 * One row of a conversation: an optional avatar beside the message's content. Compose
 * MessageAvatar (holding an Avatar) and MessageContent, which holds an optional MessageHeader (the
 * sender), one or more Bubbles, and an optional MessageFooter (such as the time). `align` is
 * `start` or `end`; `end` mirrors the row for the user's own messages. MessageGroup stacks several
 * messages. In a conversation, wrap each Message in a MessageScrollerItem (shadcn's chat rules).
 * Forwards native `<div>` attributes.
 *
 * @summary Chat message row: avatar, sender, bubbles and footer
 */
const meta = {
	component: Message,
	subcomponents: { MessageAvatar, MessageContent, MessageHeader, MessageFooter, MessageGroup },
	render: (args) => (
		<Message {...args} className="w-96">
			<MessageAvatar>
				<Avatar>
					<AvatarImage src="/web-app-manifest-192x192.png" alt="Assistant" />
					<AvatarFallback>AI</AvatarFallback>
				</Avatar>
			</MessageAvatar>
			<MessageContent>
				<MessageHeader>Assistant</MessageHeader>
				<Bubble variant="muted">
					<BubbleContent>The release adds Storybook and story tests.</BubbleContent>
				</Bubble>
				<MessageFooter>10:42</MessageFooter>
			</MessageContent>
		</Message>
	),
	// Wait for the avatar image so the accessibility check doesn't catch the fallback mid-load.
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('img', { name: 'Assistant' })).toBeVisible();
	},
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Another party's message, with avatar, sender and time. */
export const Default: Story = {};

/** `align="end"` for the user's own message; its bubble aligns to the end too. */
export const FromUser: Story = {
	args: { align: 'end' },
	render: (args) => (
		<Message {...args} className="w-96">
			<MessageContent>
				<Bubble align="end">
					<BubbleContent>What changed in this release?</BubbleContent>
				</Bubble>
			</MessageContent>
		</Message>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('What changed in this release?')).toBeVisible();
	},
};

/** MessageGroup stacks a question and its answer. */
export const Group: Story = {
	render: (args) => (
		<MessageGroup className="w-96">
			<Message {...args} align="end">
				<MessageContent>
					<Bubble align="end">
						<BubbleContent>What changed in this release?</BubbleContent>
					</Bubble>
				</MessageContent>
			</Message>
			<Message {...args}>
				<MessageAvatar>
					<Avatar>
						<AvatarImage src="/web-app-manifest-192x192.png" alt="Assistant" />
						<AvatarFallback>AI</AvatarFallback>
					</Avatar>
				</MessageAvatar>
				<MessageContent>
					<Bubble variant="muted">
						<BubbleContent>Storybook, with story and accessibility tests.</BubbleContent>
					</Bubble>
				</MessageContent>
			</Message>
		</MessageGroup>
	),
};
