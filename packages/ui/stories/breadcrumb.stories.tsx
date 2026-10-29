import {
	Breadcrumb,
	BreadcrumbEllipsis,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@repo/ui/components/breadcrumb';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import type { Meta, StoryObj } from '@storybook/react';
import { SlashIcon } from 'lucide-react';
import { expect } from 'storybook/test';

/**
 * Shows where the current page sits in the site hierarchy, as a trail of links. Compose
 * BreadcrumbList > BreadcrumbItem > BreadcrumbLink, end with a BreadcrumbPage for the current page,
 * and put a BreadcrumbSeparator between items (a chevron unless you pass children).
 * BreadcrumbEllipsis stands in for collapsed items, usually as a DropdownMenu trigger.
 * BreadcrumbLink takes `asChild` to render next/link. Breadcrumb is a `<nav aria-label="breadcrumb">`;
 * every part forwards its native element's attributes.
 *
 * @summary Trail of links from the site root to the current page
 */
const meta = {
	component: Breadcrumb,
	subcomponents: {
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbPage,
		BreadcrumbSeparator,
		BreadcrumbEllipsis,
	},
	render: (args) => (
		<Breadcrumb {...args}>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">Home</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href="#">Components</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	),
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Links to each ancestor, ending at the current page, which is marked `aria-current="page"`. */
export const Default: Story = {
	play: async ({ canvas }) => {
		const nav = canvas.getByRole('navigation', { name: 'breadcrumb' });
		await expect(nav).toBeVisible();
		await expect(canvas.getByRole('link', { name: 'Components' })).toHaveAttribute('href', '#');
		await expect(canvas.getByText('Breadcrumb')).toHaveAttribute('aria-current', 'page');
	},
};

/** Children replace the separator's chevron. */
export const CustomSeparator: Story = {
	render: (args) => (
		<Breadcrumb {...args}>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">Home</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator>
					<SlashIcon />
				</BreadcrumbSeparator>
				<BreadcrumbItem>
					<BreadcrumbPage>Settings</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	),
};

/** A long trail collapses its middle into BreadcrumbEllipsis, here a menu of the hidden links. */
export const Collapsed: Story = {
	render: (args) => (
		<Breadcrumb {...args}>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="#">Home</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<DropdownMenu>
						<DropdownMenuTrigger className="flex items-center gap-1">
							<BreadcrumbEllipsis />
							<span className="sr-only">Show hidden pages</span>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuItem>Documentation</DropdownMenuItem>
							<DropdownMenuItem>Guides</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href="#">Components</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Breadcrumb</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Show hidden pages' })).toBeVisible();
	},
};

/**
 * `asChild` on BreadcrumbLink renders your own link component, such as next/link, here a plain `<a>`.
 *
 * @summary `asChild` on BreadcrumbLink renders next/link or another link component
 */
export const CustomLink: Story = {
	render: (args) => (
		<Breadcrumb {...args}>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<a href="#home">Home</a>
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>Settings</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute('data-slot', 'breadcrumb-link');
	},
};
