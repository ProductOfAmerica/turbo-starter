import { Button } from '@repo/ui/components/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@repo/ui/components/collapsible';
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronsUpDownIcon } from 'lucide-react';
import { expect, fn } from 'storybook/test';

/**
 * Shows and hides one section on demand, such as extra details or the rest of a list.
 * CollapsibleTrigger toggles CollapsibleContent; keep the always-visible part outside the content.
 * For several sections that open one at a time, use Accordion. Built on Radix Collapsible:
 * `open`, `defaultOpen`, `onOpenChange` and `disabled`.
 *
 * @summary Toggles one section of content open and closed
 */
const meta = {
	component: Collapsible,
	subcomponents: { CollapsibleTrigger, CollapsibleContent },
	render: (args) => (
		<Collapsible {...args} className="flex w-72 flex-col gap-2">
			<div className="flex items-center justify-between gap-4">
				<p className="text-sm font-semibold">3 starred repositories</p>
				<CollapsibleTrigger asChild>
					<Button variant="ghost" size="icon-sm">
						<ChevronsUpDownIcon />
						<span className="sr-only">Show all repositories</span>
					</Button>
				</CollapsibleTrigger>
			</div>
			<div className="rounded-md border px-4 py-2 font-mono text-sm">radix-ui/primitives</div>
			<CollapsibleContent className="flex flex-col gap-2">
				<div className="rounded-md border px-4 py-2 font-mono text-sm">vercel/turborepo</div>
				<div className="rounded-md border px-4 py-2 font-mono text-sm">storybookjs/storybook</div>
			</CollapsibleContent>
		</Collapsible>
	),
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: the trigger shows the rest and calls `onOpenChange(true)`. */
export const Closed: Story = {
	args: { onOpenChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Show all repositories' });
		await expect(canvas.queryByText('vercel/turborepo')).not.toBeInTheDocument();
		await userEvent.click(trigger);
		await expect(canvas.getByText('vercel/turborepo')).toBeVisible();
		await expect(trigger).toHaveAttribute('aria-expanded', 'true');
		await expect(args.onOpenChange).toHaveBeenCalledWith(true);
	},
};

/** `defaultOpen` starts it open. */
export const Open: Story = { args: { defaultOpen: true } };
