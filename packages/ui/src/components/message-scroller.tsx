'use client';

import { Button } from '@repo/ui/components/button';
import {
	MessageScroller as MessageScrollerPrimitive,
	useMessageScroller,
	useMessageScrollerScrollable,
	useMessageScrollerVisibility,
} from '@shadcn/react/message-scroller';
import { cn } from 'cn';
import { ArrowDownIcon } from 'lucide-react';
import type * as React from 'react';

function MessageScrollerProvider(
	props: React.ComponentProps<typeof MessageScrollerPrimitive.Provider> & {
		/** Keeps the view pinned to the newest message as content is added or grows, until the user scrolls up. Defaults to false. */
		autoScroll?: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>['autoScroll'];
		/** Where the viewport starts on first render: 'start' (top), 'end' (bottom), or 'last-anchor' (the last item with `scrollAnchor`, or the end if there is none or everything fits). Defaults to 'end'. */
		defaultScrollPosition?: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>['defaultScrollPosition'];
		/** Distance in pixels from the top or bottom within which the viewport counts as at that edge. Scroll buttons hide when their edge is within this distance. Defaults to 8. */
		scrollEdgeThreshold?: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>['scrollEdgeThreshold'];
		/** Pixels of the previous item left visible above an anchor item after it is scrolled to the top, hinting at earlier content. Defaults to 64. */
		scrollPreviousItemPeek?: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>['scrollPreviousItemPeek'];
		/** Pixels of space kept between the top of the viewport and a message when scrolling to it. Defaults to 0. */
		scrollMargin?: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>['scrollMargin'];
	}
) {
	return <MessageScrollerPrimitive.Provider {...props} />;
}

function MessageScroller({ className, ...props }: React.ComponentProps<typeof MessageScrollerPrimitive.Root>) {
	return (
		<MessageScrollerPrimitive.Root
			data-slot="message-scroller"
			className={cn('group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden', className)}
			{...props}
		/>
	);
}

function MessageScrollerViewport({
	className,
	...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Viewport> & {
	/** Keeps the visible messages in place when items are added before them, such as when older history loads. Defaults to true. */
	preserveScrollOnPrepend?: React.ComponentProps<typeof MessageScrollerPrimitive.Viewport>['preserveScrollOnPrepend'];
}) {
	return (
		<MessageScrollerPrimitive.Viewport
			data-slot="message-scroller-viewport"
			className={cn(
				'size-full min-h-0 min-w-0 scroll-fade-b scrollbar-thin scrollbar-gutter-stable overflow-y-auto overscroll-contain contain-content data-autoscrolling:scrollbar-thumb-transparent data-autoscrolling:scrollbar-track-transparent data-pending-scroll:invisible',
				className
			)}
			{...props}
		/>
	);
}

function MessageScrollerContent({
	className,
	...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Content> & {
	/** Class name for the hidden spacer element after the last item, which adds the extra scroll room needed to bring an anchor item to the top. */
	spacerClassName?: React.ComponentProps<typeof MessageScrollerPrimitive.Content>['spacerClassName'];
}) {
	return (
		<MessageScrollerPrimitive.Content
			data-slot="message-scroller-content"
			className={cn('flex h-max min-h-full flex-col gap-8', className)}
			{...props}
		/>
	);
}

function MessageScrollerItem({
	className,
	scrollAnchor = false,
	...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Item> & {
	/** Identifier that lets `scrollToMessage` target this item and lets visibility tracking report it. Omit it for items that never need to be targeted. */
	messageId?: React.ComponentProps<typeof MessageScrollerPrimitive.Item>['messageId'];
	/** Marks the item as an anchor: when it is added, the viewport scrolls it to the top, which suits the user's message that starts a new turn. Defaults to false. */
	scrollAnchor?: React.ComponentProps<typeof MessageScrollerPrimitive.Item>['scrollAnchor'];
}) {
	return (
		<MessageScrollerPrimitive.Item
			data-slot="message-scroller-item"
			scrollAnchor={scrollAnchor}
			className={cn('min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]', className)}
			{...props}
		/>
	);
}

function MessageScrollerButton({
	direction = 'end',
	className,
	children,
	render,
	variant = 'secondary',
	size = 'icon-sm',
	...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Button> &
	Pick<React.ComponentProps<typeof Button>, 'variant' | 'size'> & {
		/** Replaces the default Button element. Pass an element, or a function that receives the props and the state (`active`, `direction`) and returns an element. Defaults to a Button using `variant` and `size`. */
		render?: React.ComponentProps<typeof MessageScrollerPrimitive.Button>['render'];
		/** Scroll animation used on click: 'smooth', 'instant' or 'auto'. Defaults to 'smooth'. */
		behavior?: React.ComponentProps<typeof MessageScrollerPrimitive.Button>['behavior'];
		/** Edge to scroll to: 'end' for the newest messages, 'start' for the oldest. The button is only active while that edge is out of view. Defaults to 'end'. */
		direction?: React.ComponentProps<typeof MessageScrollerPrimitive.Button>['direction'];
	}) {
	return (
		<MessageScrollerPrimitive.Button
			data-slot="message-scroller-button"
			data-direction={direction}
			data-variant={variant}
			data-size={size}
			direction={direction}
			className={cn(
				'absolute inset-s-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-200 hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-400 data-[active=false]:ease-[cubic-bezier(0.7,0,0.84,0)] data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-[cubic-bezier(0.23,1,0.32,1)] data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180',
				className
			)}
			render={render ?? <Button variant={variant} size={size} />}
			{...props}
		>
			{children ?? (
				<>
					<ArrowDownIcon />
					<span className="sr-only">{direction === 'end' ? 'Scroll to end' : 'Scroll to start'}</span>
				</>
			)}
		</MessageScrollerPrimitive.Button>
	);
}

export {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
	useMessageScroller,
	useMessageScrollerScrollable,
	useMessageScrollerVisibility,
};
