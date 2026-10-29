import { Separator } from '@repo/ui/components/separator';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
	SidebarTrigger,
	useSidebar,
} from '@repo/ui/components/sidebar';
import { TooltipProvider } from '@repo/ui/components/tooltip';
import type { Meta, StoryObj } from '@storybook/react';
import { FolderIcon, HomeIcon, InboxIcon, MoreHorizontalIcon, PlusIcon, SettingsIcon } from 'lucide-react';
import * as React from 'react';
import { expect, fn, screen, within } from 'storybook/test';

/**
 * The app's collapsible side navigation. Wrap the page in SidebarProvider and place a Sidebar next
 * to a SidebarInset (the page's `<main>`) that holds a SidebarTrigger; Ctrl+B or Cmd+B also toggles
 * it. Inside the Sidebar go SidebarHeader, SidebarContent with SidebarGroups (a label, an optional
 * SidebarGroupAction, and a SidebarMenu of SidebarMenuItems), SidebarFooter and SidebarRail.
 * Sidebar takes `side` (`left` or `right`), `variant` (`sidebar`, `floating` or `inset`) and
 * `collapsible`: `offcanvas` slides it away, `icon` shrinks it to icons, `none` keeps it open.
 * Below 768px wide it opens as a Sheet instead. SidebarMenuButton takes `isActive`, `size`,
 * `variant`, `asChild` (wrap a link) and `tooltip` (text, or TooltipContent props such as
 * `sideOffset`), shown only while collapsed to icons; tooltips need a TooltipProvider above
 * SidebarProvider. SidebarProvider takes `defaultOpen`, or `open` and
 * `onOpenChange` together (`onOpenChange` alone stops it toggling), and writes the state to a
 * `sidebar_state` cookie that the app can read to set `defaultOpen`.
 *
 * @summary App side navigation: collapsible, responsive, with grouped menus
 */
const meta = {
	component: Sidebar,
	subcomponents: {
		SidebarProvider,
		SidebarTrigger,
		SidebarInset,
		SidebarHeader,
		SidebarContent,
		SidebarFooter,
		SidebarGroup,
		SidebarGroupLabel,
		SidebarGroupAction,
		SidebarGroupContent,
		SidebarMenu,
		SidebarMenuItem,
		SidebarMenuButton,
		SidebarMenuAction,
		SidebarMenuBadge,
		SidebarMenuSub,
		SidebarMenuSubItem,
		SidebarMenuSubButton,
		SidebarMenuSkeleton,
		SidebarInput,
		SidebarSeparator,
		SidebarRail,
	},
	parameters: {
		layout: 'fullscreen',
		// The desktop sidebar is position: fixed, so on the docs page each story gets its own frame.
		docs: { story: { inline: false, height: '480px' } },
	},
	render: (args) => (
		<TooltipProvider>
			<SidebarProvider>
				<Sidebar {...args}>
					<SidebarHeader>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton size="lg" asChild>
									<a href="#acme">
										<span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
											A
										</span>
										<span className="font-semibold">Acme</span>
									</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
						<SidebarInput
							aria-label="Search"
							placeholder="Search"
							className="group-data-[collapsible=icon]:hidden"
						/>
					</SidebarHeader>
					<SidebarContent>
						<SidebarGroup>
							<SidebarGroupLabel>Platform</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton asChild isActive tooltip="Home">
											<a href="#home">
												<HomeIcon />
												<span>Home</span>
											</a>
										</SidebarMenuButton>
									</SidebarMenuItem>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Inbox">
											<a href="#inbox">
												<InboxIcon />
												<span>Inbox</span>
											</a>
										</SidebarMenuButton>
										<SidebarMenuBadge>24</SidebarMenuBadge>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
						<SidebarSeparator />
						<SidebarGroup>
							<SidebarGroupLabel>Projects</SidebarGroupLabel>
							<SidebarGroupAction>
								<PlusIcon />
								<span className="sr-only">Add project</span>
							</SidebarGroupAction>
							<SidebarGroupContent>
								<SidebarMenu>
									<SidebarMenuItem>
										<SidebarMenuButton asChild tooltip="Design system">
											<a href="#design-system">
												<FolderIcon />
												<span>Design system</span>
											</a>
										</SidebarMenuButton>
										<SidebarMenuAction showOnHover>
											<MoreHorizontalIcon />
											<span className="sr-only">Project options</span>
										</SidebarMenuAction>
										<SidebarMenuSub>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton href="#" isActive>
													Tokens
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton href="#">Components</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										</SidebarMenuSub>
									</SidebarMenuItem>
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
					</SidebarContent>
					<SidebarFooter>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton tooltip={{ children: 'Settings', sideOffset: 8 }}>
									<SettingsIcon />
									<span>Settings</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>
					<SidebarRail />
				</Sidebar>
				<SidebarInset>
					<header className="flex h-12 items-center gap-2 border-b px-4">
						{args.collapsible !== 'none' && (
							<>
								<SidebarTrigger />
								<Separator orientation="vertical" className="h-4" />
							</>
						)}
						<p className="text-sm font-medium">Home</p>
					</header>
					<div className="p-4 text-sm text-muted-foreground">Page content</div>
				</SidebarInset>
			</SidebarProvider>
		</TooltipProvider>
	),
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The trigger slides the sidebar off canvas and back; Ctrl+B does the same. */
export const Default: Story = {
	play: async ({ canvas, canvasElement, userEvent }) => {
		const sidebar = canvasElement.querySelector('[data-slot="sidebar"]');
		await expect(sidebar).toHaveAttribute('data-state', 'expanded');
		await userEvent.click(within(canvas.getByRole('main')).getByRole('button', { name: 'Toggle Sidebar' }));
		await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
		await userEvent.keyboard('{Control>}b{/Control}');
		await expect(sidebar).toHaveAttribute('data-state', 'expanded');
	},
};

/** `floating` insets the sidebar with rounded corners and a shadow. */
export const Floating: Story = { args: { variant: 'floating' } };

/** `inset` sets the main content in a rounded panel beside the sidebar. */
export const Inset: Story = { args: { variant: 'inset' } };

/** `side="right"` docks it on the right. */
export const Right: Story = { args: { side: 'right' } };

/** `collapsible="icon"` shrinks it to an icon rail; menu buttons then show their `tooltip`. */
export const CollapsesToIcons: Story = {
	args: { collapsible: 'icon' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.keyboard('{Control>}b{/Control}');
		await expect(canvasElement.querySelector('[data-slot="sidebar"]')).toHaveAttribute('data-collapsible', 'icon');
		await userEvent.hover(canvas.getByRole('link', { name: 'Inbox' }));
		await expect(await screen.findByRole('tooltip')).toHaveTextContent('Inbox');
	},
};

/** `collapsible="none"` keeps the sidebar open, so the page needs no trigger. */
export const NotCollapsible: Story = { args: { collapsible: 'none' } };

/** Below 768px the trigger opens the sidebar as a Sheet. */
export const Mobile: Story = {
	globals: { viewport: { value: 'mobile1' } },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(within(canvas.getByRole('main')).getByRole('button', { name: 'Toggle Sidebar' }));
		const sheet = await screen.findByRole('dialog', { name: 'Sidebar' });
		await expect(within(sheet).getByRole('link', { name: 'Inbox' })).toBeVisible();
	},
};

/**
 * SidebarMenuSkeleton holds the place of menu items while they load. `showIcon` adds a placeholder
 * for the item's icon; leave it off for items without one.
 *
 * @summary SidebarMenuSkeleton placeholders while items load, with or without an icon
 */
export const Loading: Story = {
	render: (args) => (
		<SidebarProvider>
			<Sidebar {...args}>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Projects</SidebarGroupLabel>
						<SidebarMenu>
							{['first', 'second'].map((key) => (
								<SidebarMenuItem key={key}>
									<SidebarMenuSkeleton showIcon />
								</SidebarMenuItem>
							))}
							<SidebarMenuItem>
								<SidebarMenuSkeleton />
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
			<SidebarInset>
				<div className="p-4 text-sm text-muted-foreground">Page content</div>
			</SidebarInset>
		</SidebarProvider>
	),
};

// The provider's handler isn't a Sidebar prop, so it can't be an arg; cleared before each run.
const onOpenChange = fn();

/**
 * Pass `open` and `onOpenChange` to the SidebarProvider to own the state yourself. The trigger
 * calls `onOpenChange`, and the sidebar only moves when you pass the new value back in `open`.
 * `useSidebar().setOpen` reports to the same handler.
 *
 * @summary `open` and `onOpenChange` on SidebarProvider to own the open state
 */
export const Controlled: Story = {
	beforeEach() {
		onOpenChange.mockClear();
	},
	render: (args) => <ControlledSidebar {...args} />,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const sidebar = canvasElement.querySelector('[data-slot="sidebar"]');
		await expect(sidebar).toHaveAttribute('data-state', 'expanded');
		await userEvent.click(canvas.getByRole('button', { name: 'Toggle Sidebar' }));
		await expect(onOpenChange).toHaveBeenLastCalledWith(false);
		await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
		await userEvent.click(canvas.getByRole('button', { name: 'Toggle Sidebar' }));
		await expect(onOpenChange).toHaveBeenLastCalledWith(true);
		await expect(sidebar).toHaveAttribute('data-state', 'expanded');
		await userEvent.click(canvas.getByRole('button', { name: 'Close sidebar' }));
		await expect(onOpenChange).toHaveBeenLastCalledWith(false);
		await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
	},
};

function CloseButton() {
	const { setOpen } = useSidebar();

	return (
		<button type="button" onClick={() => setOpen(false)}>
			Close sidebar
		</button>
	);
}

function ControlledSidebar(props: React.ComponentProps<typeof Sidebar>) {
	const [open, setOpen] = React.useState(true);

	return (
		<SidebarProvider
			open={open}
			onOpenChange={(next) => {
				onOpenChange(next);
				setOpen(next);
			}}
		>
			<Sidebar {...props}>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Platform</SidebarGroupLabel>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton>
									<HomeIcon />
									<span>Home</span>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
			<SidebarInset>
				<header className="flex h-12 items-center gap-2 border-b px-4">
					<SidebarTrigger />
					<CloseButton />
				</header>
			</SidebarInset>
		</SidebarProvider>
	);
}

/**
 * `asChild` on SidebarGroupLabel, SidebarGroupAction, SidebarMenuAction and SidebarMenuSubButton
 * renders your own element (here links) with the sidebar's styles.
 *
 * @summary `asChild` on sidebar parts renders your own links with the sidebar styles
 */
export const AsChildParts: Story = {
	render: (args) => (
		<SidebarProvider>
			<Sidebar {...args}>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel asChild>
							<a href="#projects">Projects</a>
						</SidebarGroupLabel>
						<SidebarGroupAction asChild>
							<a href="#new-project">
								<PlusIcon />
								<span className="sr-only">New project</span>
							</a>
						</SidebarGroupAction>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton asChild>
										<a href="#design-system">
											<FolderIcon />
											<span>Design system</span>
										</a>
									</SidebarMenuButton>
									<SidebarMenuAction asChild>
										<a href="#design-system-options">
											<MoreHorizontalIcon />
											<span className="sr-only">Design system options</span>
										</a>
									</SidebarMenuAction>
									<SidebarMenuSub>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild>
												<a href="#tokens">Tokens</a>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									</SidebarMenuSub>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>
			<SidebarInset>
				<div className="p-4 text-sm text-muted-foreground">Page content</div>
			</SidebarInset>
		</SidebarProvider>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Projects' })).toHaveAttribute('data-slot', 'sidebar-group-label');
		await expect(canvas.getByRole('link', { name: 'New project' })).toHaveAttribute(
			'data-slot',
			'sidebar-group-action'
		);
		await expect(canvas.getByRole('link', { name: 'Design system options' })).toHaveAttribute(
			'data-slot',
			'sidebar-menu-action'
		);
		await expect(canvas.getByRole('link', { name: 'Tokens' })).toHaveAttribute(
			'data-slot',
			'sidebar-menu-sub-button'
		);
	},
};
