import { Bubble, BubbleContent } from '@repo/ui/components/bubble';
import { Message, MessageContent } from '@repo/ui/components/message';
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from '@repo/ui/components/message-scroller';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';

const messages = Array.from({ length: 12 }, (_, index) => ({
	id: `m${index + 1}`,
	role: index % 2 === 0 ? 'user' : 'assistant',
	text: index % 2 === 0 ? `Question ${index / 2 + 1}?` : `Answer to question ${(index + 1) / 2}.`,
}));

/**
 * The scrolling transcript of a chat. It starts at the latest message, can follow new messages
 * as they stream in, and shows a button to jump back to the end. Nest MessageScrollerProvider >
 * MessageScroller > MessageScrollerViewport > MessageScrollerContent, wrap every message in a
 * MessageScrollerItem with a `messageId` (`scrollAnchor` on the user's turns keeps their question
 * in view while the reply streams), and add a MessageScrollerButton after the viewport. The
 * provider takes `autoScroll` (follow new content; off by default), `defaultScrollPosition`
 * (`end`, `start` or `last-anchor`) and `scrollMargin`. The viewport is a focusable region labelled
 * "Messages", and the content is a live log. Hooks: `useMessageScroller` (`scrollToEnd`,
 * `scrollToMessage`, `scrollToStart`), `useMessageScrollerScrollable` and
 * `useMessageScrollerVisibility`. Built on `@shadcn/react/message-scroller`.
 *
 * @summary Chat transcript that scrolls, anchors and jumps to the latest message
 */
const meta = {
	component: MessageScroller,
	subcomponents: {
		MessageScrollerProvider,
		MessageScrollerViewport,
		MessageScrollerContent,
		MessageScrollerItem,
		MessageScrollerButton,
	},
	render: (args) => (
		<MessageScrollerProvider>
			<MessageScroller {...args} className="h-80 w-96 rounded-lg border">
				<MessageScrollerViewport>
					<MessageScrollerContent className="p-4">
						{messages.map((message) => (
							<MessageScrollerItem
								key={message.id}
								messageId={message.id}
								scrollAnchor={message.role === 'user'}
							>
								<Message align={message.role === 'user' ? 'end' : 'start'}>
									<MessageContent>
										<Bubble
											align={message.role === 'user' ? 'end' : 'start'}
											variant={message.role === 'user' ? 'default' : 'muted'}
										>
											<BubbleContent>{message.text}</BubbleContent>
										</Bubble>
									</MessageContent>
								</Message>
							</MessageScrollerItem>
						))}
					</MessageScrollerContent>
				</MessageScrollerViewport>
				<MessageScrollerButton />
			</MessageScroller>
		</MessageScrollerProvider>
	),
} satisfies Meta<typeof MessageScroller>;

export default meta;
type Story = StoryObj<typeof meta>;

const atEnd = (viewport: HTMLElement) => viewport.scrollTop + viewport.clientHeight >= viewport.scrollHeight - 1;

/** Opens at the latest message. Scrolled up, the button appears and jumps back to the end. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		const viewport = canvas.getByRole('region', { name: 'Messages' });
		await waitFor(() => expect(atEnd(viewport)).toBe(true));
		viewport.scrollTop = 0;
		const button = canvas.getByRole('button', { name: 'Scroll to end' });
		await waitFor(() => expect(button).toHaveAttribute('data-active', 'true'));
		await userEvent.click(button);
		await waitFor(() => expect(atEnd(viewport)).toBe(true));
	},
};

/** A `direction="start"` MessageScrollerButton jumps back to the top of a long transcript. */
export const ScrollToStart: Story = {
	render: (args) => (
		<MessageScrollerProvider>
			<MessageScroller {...args} className="h-80 w-96 rounded-lg border">
				<MessageScrollerViewport>
					<MessageScrollerContent className="p-4">
						{messages.map((message) => (
							<MessageScrollerItem key={message.id} messageId={message.id}>
								<Message align="start">
									<MessageContent>
										<Bubble variant="muted">
											<BubbleContent>{message.text}</BubbleContent>
										</Bubble>
									</MessageContent>
								</Message>
							</MessageScrollerItem>
						))}
					</MessageScrollerContent>
				</MessageScrollerViewport>
				<MessageScrollerButton direction="start" />
			</MessageScroller>
		</MessageScrollerProvider>
	),
	play: async ({ canvas, userEvent }) => {
		const viewport = canvas.getByRole('region', { name: 'Messages' });
		await waitFor(() => expect(atEnd(viewport)).toBe(true));
		const button = canvas.getByRole('button', { name: 'Scroll to start' });
		await waitFor(() => expect(button).toHaveAttribute('data-active', 'true'));
		await userEvent.click(button);
		await waitFor(() => expect(viewport.scrollTop).toBe(0));
	},
};
