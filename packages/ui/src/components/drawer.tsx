'use client';

import { cn } from 'cn';
import type * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

function Drawer({
	...props
}: React.ComponentProps<typeof DrawerPrimitive.Root> & {
	/** The snap point the drawer is currently at when controlled: a fraction of the screen height (0 to 1), a pixel string such as `'355px'`, or `null` when closed. Use with `snapPoints` and `setActiveSnapPoint`. */
	activeSnapPoint?: React.ComponentProps<typeof DrawerPrimitive.Root>['activeSnapPoint'];
	/** Called with the new snap point when the user drags to a different one. Pair with `activeSnapPoint` to control it. */
	setActiveSnapPoint?: React.ComponentProps<typeof DrawerPrimitive.Root>['setActiveSnapPoint'];
	/** Whether the drawer is open, when controlled. Pair with `onOpenChange`. */
	open?: React.ComponentProps<typeof DrawerPrimitive.Root>['open'];
	/** Called with the new open state when the drawer opens or closes, including by dragging, Escape or an outside click. */
	onOpenChange?: React.ComponentProps<typeof DrawerPrimitive.Root>['onOpenChange'];
	/** Scales and shifts the page behind the drawer while it is open, for the iOS-sheet effect. Needs the page content wrapped in an element with `data-vaul-drawer-wrapper`. Defaults to `false`. */
	shouldScaleBackground?: React.ComponentProps<typeof DrawerPrimitive.Root>['shouldScaleBackground'];
	/** Called repeatedly while the user drags the drawer, with the pointer event and the fraction (0 to 1) of the drawer's size dragged so far. */
	onDrag?: React.ComponentProps<typeof DrawerPrimitive.Root>['onDrag'];
	/** Called when the user lets go after dragging, with the pointer event and whether the drawer is staying open (`true`) or closing (`false`). */
	onRelease?: React.ComponentProps<typeof DrawerPrimitive.Root>['onRelease'];
	/** Marks this drawer as nested inside another one. Set by `Drawer.NestedRoot`, which also wires it to its parent; rarely needed directly. */
	nested?: React.ComponentProps<typeof DrawerPrimitive.Root>['nested'];
	/** Called when the drawer starts closing (dismiss, drag past the close threshold, or a close button). */
	onClose?: React.ComponentProps<typeof DrawerPrimitive.Root>['onClose'];
	/** Element the drawer portals into, and measures for snap points, instead of `document.body`. */
	container?: React.ComponentProps<typeof DrawerPrimitive.Root>['container'];
	/** On iOS Safari, skips restoring the page scroll position after closing if the URL changed while the drawer was open. Defaults to `false`. */
	preventScrollRestoration?: React.ComponentProps<typeof DrawerPrimitive.Root>['preventScrollRestoration'];
	/** Moves focus into the drawer when it opens. Vaul suppresses Radix's auto-focus unless this is `true`. Defaults to `false`. */
	autoFocus?: React.ComponentProps<typeof DrawerPrimitive.Root>['autoFocus'];
}) {
	return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
	return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
	return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Close>) {
	return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
	return (
		<DrawerPrimitive.Overlay
			data-slot="drawer-overlay"
			className={cn(
				'fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
				className
			)}
			{...props}
		/>
	);
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof DrawerPrimitive.Content>) {
	return (
		<DrawerPortal data-slot="drawer-portal">
			<DrawerOverlay />
			<DrawerPrimitive.Content
				data-slot="drawer-content"
				className={cn(
					'group/drawer-content fixed z-50 flex h-auto flex-col bg-popover text-sm text-popover-foreground data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-xl data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-r-xl data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-l-xl data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-xl data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm',
					className
				)}
				{...props}
			>
				<div className="mx-auto mt-4 hidden h-1.5 w-[100px] shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
				{children}
			</DrawerPrimitive.Content>
		</DrawerPortal>
	);
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="drawer-header"
			className={cn(
				'flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left',
				className
			)}
			{...props}
		/>
	);
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return <div data-slot="drawer-footer" className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />;
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
	return (
		<DrawerPrimitive.Title
			data-slot="drawer-title"
			className={cn('font-medium text-foreground', className)}
			{...props}
		/>
	);
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Description>) {
	return (
		<DrawerPrimitive.Description
			data-slot="drawer-description"
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}

export {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	DrawerPortal,
	DrawerTitle,
	DrawerTrigger,
};
