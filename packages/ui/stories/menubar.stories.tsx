import {
	Menubar,
	MenubarCheckboxItem,
	MenubarContent,
	MenubarGroup,
	MenubarItem,
	MenubarLabel,
	MenubarMenu,
	MenubarRadioGroup,
	MenubarRadioItem,
	MenubarSeparator,
	MenubarShortcut,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from '@repo/ui/components/menubar';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen } from 'storybook/test';

/**
 * A desktop-application style bar of menus (File, Edit, View). Each MenubarMenu pairs a
 * MenubarTrigger with MenubarContent; the arrow keys move between menus. Items mirror
 * DropdownMenu: `inset`, `variant` (`default` or `destructive`), checkbox and radio items,
 * shortcuts and submenus. Reserve it for app-like tools; most sites want NavigationMenu. Built on
 * Radix Menubar.
 *
 * @summary Desktop-app menu bar (File, Edit, View) with keyboard navigation
 */
const meta = {
	component: Menubar,
	subcomponents: {
		MenubarMenu,
		MenubarTrigger,
		MenubarContent,
		MenubarItem,
		MenubarCheckboxItem,
		MenubarRadioGroup,
		MenubarRadioItem,
		MenubarSeparator,
		MenubarShortcut,
		MenubarSub,
		MenubarSubTrigger,
		MenubarSubContent,
		MenubarGroup,
		MenubarLabel,
	},
	render: (args) => (
		<Menubar {...args}>
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent>
					<MenubarLabel>Tabs</MenubarLabel>
					<MenubarGroup>
						<MenubarItem>
							New tab
							<MenubarShortcut>⌘T</MenubarShortcut>
						</MenubarItem>
					</MenubarGroup>
					<MenubarSub>
						<MenubarSubTrigger>Share</MenubarSubTrigger>
						<MenubarSubContent>
							<MenubarItem>Email link</MenubarItem>
						</MenubarSubContent>
					</MenubarSub>
					<MenubarSeparator />
					<MenubarItem>Print</MenubarItem>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenubarContent>
					<MenubarCheckboxItem checked>Show bookmarks bar</MenubarCheckboxItem>
					<MenubarSeparator />
					<MenubarRadioGroup value="comfortable">
						<MenubarRadioItem value="compact">Compact</MenubarRadioItem>
						<MenubarRadioItem value="comfortable">Comfortable</MenubarRadioItem>
					</MenubarRadioGroup>
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	),
} satisfies Meta<typeof Menubar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clicking a trigger opens its menu. */
export const Open: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('menuitem', { name: 'File' }));
		await expect(await screen.findByRole('menuitem', { name: /New tab/ })).toBeVisible();
		await expect(screen.getByText('Tabs')).toBeVisible();
	},
};

/** With a menu open, the arrow keys move to the next menu. */
export const KeyboardNavigation: Story = {
	tags: ['!manifest'],
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('menuitem', { name: 'File' }));
		await screen.findByRole('menuitem', { name: /New tab/ });
		await userEvent.keyboard('{ArrowRight}');
		await expect(await screen.findByRole('menuitemcheckbox', { name: 'Show bookmarks bar' })).toBeVisible();
	},
};
