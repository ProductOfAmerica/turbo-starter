import { Button } from '@repo/ui/components/button';
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemFooter,
	ItemGroup,
	ItemHeader,
	ItemMedia,
	ItemSeparator,
	ItemTitle,
} from '@repo/ui/components/item';
import type { Meta, StoryObj } from '@storybook/react';
import { BellIcon, ChevronRightIcon, ShieldCheckIcon } from 'lucide-react';
import { expect } from 'storybook/test';

/**
 * A row for one thing in a list or settings page: media, a title and description, and actions.
 * Compose ItemMedia (`variant`: `default`, `icon` or `image`), ItemContent (ItemTitle and
 * ItemDescription) and ItemActions; ItemHeader and ItemFooter span the full width. Item's `variant`
 * is `default`, `outline` or `muted`, and `size` is `default`, `sm` or `xs`. `asChild` renders it as
 * a link, which then gets a hover style. ItemGroup stacks items, with ItemSeparator between them.
 * Forwards native `<div>` attributes.
 *
 * @summary Row with media, title, description and actions
 */
const meta = {
	component: Item,
	subcomponents: {
		ItemMedia,
		ItemContent,
		ItemTitle,
		ItemDescription,
		ItemActions,
		ItemHeader,
		ItemFooter,
		ItemGroup,
		ItemSeparator,
	},
	render: (args) => (
		<Item {...args} className="w-96">
			<ItemMedia variant="icon">
				<ShieldCheckIcon />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>Two-factor authentication</ItemTitle>
				<ItemDescription>Verify sign-ins with a code from your phone.</ItemDescription>
			</ItemContent>
			<ItemActions>
				<Button size="sm" variant="outline">
					Enable
				</Button>
			</ItemActions>
		</Item>
	),
} satisfies Meta<typeof Item>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No border or fill. */
export const Default: Story = {};

/** `variant="outline"` adds a border. */
export const Outline: Story = { args: { variant: 'outline' } };

/** `variant="muted"` adds a soft fill. */
export const Muted: Story = { args: { variant: 'muted' } };

/** `size="sm"`. */
export const Small: Story = { args: { size: 'sm', variant: 'outline' } };

/** `size="xs"`, the size used inside menus. */
export const ExtraSmall: Story = { args: { size: 'xs', variant: 'outline' } };

/** With `asChild` the whole row is a link. */
export const AsLink: Story = {
	render: (args) => (
		<Item {...args} variant="outline" className="w-96" asChild>
			<a href="#notifications">
				<ItemMedia variant="icon">
					<BellIcon />
				</ItemMedia>
				<ItemContent>
					<ItemTitle>Notifications</ItemTitle>
					<ItemDescription>Choose what you're notified about.</ItemDescription>
				</ItemContent>
				<ItemActions>
					<ChevronRightIcon className="size-4" />
				</ItemActions>
			</a>
		</Item>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: /Notifications/ })).toHaveAttribute('href', '#notifications');
	},
};

/** ItemGroup stacks items, with ItemSeparator between them; ItemHeader spans the row. */
export const Group: Story = {
	render: (args) => (
		<ItemGroup className="w-96">
			<Item {...args}>
				<ItemHeader>
					<ItemTitle>Security</ItemTitle>
				</ItemHeader>
				<ItemContent>
					<ItemDescription>Two-factor authentication is on.</ItemDescription>
				</ItemContent>
			</Item>
			<ItemSeparator />
			<Item {...args}>
				<ItemContent>
					<ItemTitle>Sessions</ItemTitle>
					<ItemDescription>Signed in on 2 devices.</ItemDescription>
				</ItemContent>
				<ItemFooter>
					<Button size="sm" variant="outline">
						Sign out everywhere
					</Button>
				</ItemFooter>
			</Item>
		</ItemGroup>
	),
};

/** ItemMedia's `default` variant puts the icon or image in a plain slot, without a tile. */
export const PlainMedia: Story = {
	render: (args) => (
		<Item {...args} className="w-96">
			<ItemMedia>
				<ShieldCheckIcon className="size-5" />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>Two-factor authentication</ItemTitle>
				<ItemDescription>Verify sign-ins with a code from your phone.</ItemDescription>
			</ItemContent>
		</Item>
	),
};
