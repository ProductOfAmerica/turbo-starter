import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@repo/ui/components/pagination';
import type { Meta, StoryObj } from '@storybook/react';
import { type MouseEvent, useState } from 'react';
import { expect } from 'storybook/test';

/**
 * Page links for a list split into pages. Compose Pagination > PaginationContent > PaginationItem
 * around PaginationPrevious, a PaginationLink per page, PaginationEllipsis and PaginationNext.
 * `isActive` on a PaginationLink marks the current page (`aria-current="page"`). The links are
 * plain anchors: give each an `href`, or handle `onClick` for client-side paging. PaginationLink
 * takes Button's `size` (`icon` by default). PaginationPrevious and PaginationNext take `text`,
 * shown from the `sm` breakpoint up, and keep their "Go to previous/next page" labels.
 *
 * @summary Previous, numbered and next links for a paged list
 */
const meta = {
	component: Pagination,
	subcomponents: {
		PaginationContent,
		PaginationItem,
		PaginationLink,
		PaginationPrevious,
		PaginationNext,
		PaginationEllipsis,
	},
	render: (args) => (
		<Pagination {...args}>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious href="#" />
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#">1</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#" isActive>
						2
					</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationLink href="#">3</PaginationLink>
				</PaginationItem>
				<PaginationItem>
					<PaginationEllipsis />
				</PaginationItem>
				<PaginationItem>
					<PaginationNext href="#" />
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	),
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Page 2 of a longer list; the ellipsis stands for pages not shown. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('navigation', { name: 'pagination' })).toBeVisible();
		await expect(canvas.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
		await expect(canvas.getByRole('link', { name: 'Go to previous page' })).toBeVisible();
	},
};

const PAGE_COUNT = 5;

function ClientSidePaging() {
	const [page, setPage] = useState(1);
	const goTo = (target: number) => (event: MouseEvent) => {
		event.preventDefault();
		setPage(Math.min(Math.max(target, 1), PAGE_COUNT));
	};
	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious href="#" onClick={goTo(page - 1)} />
				</PaginationItem>
				{Array.from({ length: PAGE_COUNT }, (_, index) => index + 1).map((number) => (
					<PaginationItem key={number}>
						<PaginationLink href="#" isActive={number === page} onClick={goTo(number)}>
							{number}
						</PaginationLink>
					</PaginationItem>
				))}
				<PaginationItem>
					<PaginationNext href="#" onClick={goTo(page + 1)} />
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}

/** Client-side paging: `onClick` updates the current page in state. */
export const ClientSide: Story = {
	render: () => <ClientSidePaging />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('link', { name: '3' }));
		await expect(canvas.getByRole('link', { name: '3' })).toHaveAttribute('aria-current', 'page');
		await userEvent.click(canvas.getByRole('link', { name: 'Go to next page' }));
		await expect(canvas.getByRole('link', { name: '4' })).toHaveAttribute('aria-current', 'page');
		await expect(canvas.getByRole('link', { name: '3' })).not.toHaveAttribute('aria-current');
	},
};
