import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '@repo/ui/components/table';
import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { expect } from 'storybook/test';

const invoices = [
	{ id: 'INV001', status: 'Paid', method: 'Credit card', amount: '$250.00' },
	{ id: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
	{ id: 'INV003', status: 'Unpaid', method: 'Bank transfer', amount: '$350.00' },
];

function InvoiceTable({ selectedId, ...props }: ComponentProps<typeof Table> & { selectedId?: string }) {
	return (
		<Table {...props}>
			<TableCaption>Recent invoices</TableCaption>
			<TableHeader>
				<TableRow>
					<TableHead>Invoice</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Method</TableHead>
					<TableHead className="text-right">Amount</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{invoices.map((invoice) => (
					<TableRow key={invoice.id} data-state={invoice.id === selectedId ? 'selected' : undefined}>
						<TableCell className="font-medium">{invoice.id}</TableCell>
						<TableCell>{invoice.status}</TableCell>
						<TableCell>{invoice.method}</TableCell>
						<TableCell className="text-right">{invoice.amount}</TableCell>
					</TableRow>
				))}
			</TableBody>
			<TableFooter>
				<TableRow>
					<TableCell colSpan={3}>Total</TableCell>
					<TableCell className="text-right">$750.00</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	);
}

/**
 * A styled HTML table for rows of data. Compose TableHeader, TableBody and TableFooter of
 * TableRows holding TableHead and TableCell, and add a TableCaption, which also names the table
 * for screen readers. Table wraps itself in a container that scrolls horizontally when the table
 * is too wide. A TableRow with `data-state="selected"` is highlighted. Each part forwards its
 * native element's attributes.
 *
 * @summary Styled table with caption, header, body and footer
 */
const meta = {
	component: Table,
	subcomponents: { TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption },
	render: (args) => <InvoiceTable {...args} />,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A caption, header row, body rows and a footer total. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('table', { name: 'Recent invoices' })).toBeVisible();
		await expect(canvas.getAllByRole('columnheader')).toHaveLength(4);
	},
};

/** `data-state="selected"` highlights a row, such as one picked with a checkbox. */
export const SelectedRow: Story = {
	render: (args) => <InvoiceTable {...args} selectedId="INV002" />,
};
