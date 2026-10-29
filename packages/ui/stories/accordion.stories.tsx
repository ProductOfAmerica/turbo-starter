import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/components/accordion';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

/**
 * Stacked sections that each expand to show their content, such as an FAQ. `type="single"` keeps
 * one item open at a time (add `collapsible` so the open one can close again); `type="multiple"`
 * lets any number stay open. Give each AccordionItem a unique `value`. Built on Radix Accordion:
 * `value`, `defaultValue` and `onValueChange` (a string for single, an array for multiple), and
 * `disabled`. AccordionContent's `className` styles its inner wrapper.
 *
 * @summary Expandable sections, one or several open at a time
 */
const meta = {
	component: Accordion,
	subcomponents: { AccordionItem, AccordionTrigger, AccordionContent },
	render: (args) => (
		<Accordion {...args} className="w-96">
			<AccordionItem value="accessible">
				<AccordionTrigger>Is it accessible?</AccordionTrigger>
				<AccordionContent>Yes. It follows the WAI-ARIA accordion pattern.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="styled">
				<AccordionTrigger>Can I restyle it?</AccordionTrigger>
				<AccordionContent>Yes. Every part takes a className.</AccordionContent>
			</AccordionItem>
			<AccordionItem value="animated">
				<AccordionTrigger>Is it animated?</AccordionTrigger>
				<AccordionContent>Yes. Content slides open and closed.</AccordionContent>
			</AccordionItem>
		</Accordion>
	),
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One item open at a time. Opening another closes the first; `collapsible` lets it close. */
export const Single: Story = {
	args: { type: 'single', collapsible: true },
	play: async ({ canvas, userEvent }) => {
		const first = canvas.getByRole('button', { name: 'Is it accessible?' });
		await userEvent.click(first);
		await expect(canvas.getByRole('region', { name: 'Is it accessible?' })).toBeVisible();
		const second = canvas.getByRole('button', { name: 'Can I restyle it?' });
		await userEvent.click(second);
		await expect(first).toHaveAttribute('aria-expanded', 'false');
		await userEvent.click(second);
		await expect(canvas.queryByRole('region')).not.toBeInTheDocument();
	},
};

/** Any number of items open at once; `defaultValue` takes an array. */
export const Multiple: Story = {
	args: { type: 'multiple', defaultValue: ['accessible'] },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Is it animated?' }));
		await expect(canvas.getAllByRole('region')).toHaveLength(2);
	},
};
