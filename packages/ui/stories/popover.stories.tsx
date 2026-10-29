import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from '@repo/ui/components/popover';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, waitFor } from 'storybook/test';

/**
 * Rich, interactive content anchored to a trigger, such as a small form, rendered in a portal. It
 * closes on Escape or a click outside and doesn't block the rest of the page. For plain hints use
 * Tooltip; for a list of actions use DropdownMenu. PopoverContent takes `align` (`center` default)
 * and `sideOffset` (4), plus Radix's `side`. PopoverHeader, PopoverTitle and PopoverDescription
 * structure the content. PopoverContent is a dialog, so point its `aria-labelledby` at the title.
 * PopoverAnchor positions the content against another element than the trigger. Built on Radix Popover: `open`, `onOpenChange`.
 *
 * @summary Anchored, non-modal panel for small interactive content
 */
const meta = {
	component: Popover,
	subcomponents: { PopoverAnchor, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription },
	render: (args) => (
		<Popover {...args}>
			<PopoverTrigger asChild>
				<Button variant="outline">Dimensions</Button>
			</PopoverTrigger>
			<PopoverContent className="w-72" aria-labelledby="dimensions-title">
				<PopoverHeader>
					<PopoverTitle id="dimensions-title">Dimensions</PopoverTitle>
					<PopoverDescription>Set the layer's size.</PopoverDescription>
				</PopoverHeader>
				<div className="grid grid-cols-3 items-center gap-2">
					<Label htmlFor="width">Width</Label>
					<Input id="width" defaultValue="100%" className="col-span-2 h-8" />
					<Label htmlFor="height">Height</Label>
					<Input id="height" defaultValue="25px" className="col-span-2 h-8" />
				</div>
			</PopoverContent>
		</Popover>
	),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clicking the trigger opens the popover next to it. */
export const Open: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Dimensions' }));
		await expect(await screen.findByLabelText('Width')).toBeVisible();
	},
};

/** Escape closes it. */
export const ClosesWithEscape: Story = {
	tags: ['!manifest'],
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Dimensions' }));
		await screen.findByLabelText('Width');
		await userEvent.keyboard('{Escape}');
		await waitFor(() => expect(screen.queryByLabelText('Width')).not.toBeInTheDocument());
	},
};

/** PopoverAnchor places the popover against a different element than the trigger, here the whole row. */
export const CustomAnchor: Story = {
	render: () => (
		<Popover>
			<PopoverAnchor asChild>
				<div className="flex w-80 items-center justify-between rounded-md border p-2">
					<span className="text-sm">Layer</span>
					<PopoverTrigger asChild>
						<Button variant="outline">Dimensions</Button>
					</PopoverTrigger>
				</div>
			</PopoverAnchor>
			<PopoverContent aria-labelledby="anchored-title">
				<PopoverHeader>
					<PopoverTitle id="anchored-title">Dimensions</PopoverTitle>
					<PopoverDescription>Anchored to the row.</PopoverDescription>
				</PopoverHeader>
			</PopoverContent>
		</Popover>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Dimensions' }));
		await expect(await screen.findByText('Anchored to the row.')).toBeVisible();
	},
};
