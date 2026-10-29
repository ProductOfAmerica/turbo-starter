import { Button } from '@repo/ui/components/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui/components/tooltip';
import type { Meta, StoryObj } from '@storybook/react';
import { PlusIcon } from 'lucide-react';
import { expect, screen } from 'storybook/test';

/**
 * A short label shown on hover or keyboard focus, typically naming an icon-only button. It must not
 * hold anything interactive or essential. Tooltips need a TooltipProvider ancestor (render one near
 * the root of the app; it sets `delayDuration`, 0 here). TooltipContent takes Radix's `side` and
 * `sideOffset` (0). Built on Radix Tooltip: `open`, `defaultOpen`, `onOpenChange`.
 *
 * @summary Hover or focus label for a control; needs a TooltipProvider ancestor
 */
const meta = {
	component: Tooltip,
	subcomponents: { TooltipTrigger, TooltipContent, TooltipProvider },
	decorators: [
		(Story) => (
			<TooltipProvider>
				<Story />
			</TooltipProvider>
		),
	],
	render: (args) => (
		<Tooltip {...args}>
			<TooltipTrigger asChild>
				<Button variant="outline" size="icon" aria-label="Add to library">
					<PlusIcon />
				</Button>
			</TooltipTrigger>
			<TooltipContent>Add to library</TooltipContent>
		</Tooltip>
	),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hovering the trigger shows the tooltip. */
export const OnHover: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.hover(canvas.getByRole('button', { name: 'Add to library' }));
		await expect(await screen.findByRole('tooltip')).toHaveTextContent('Add to library');
	},
};

/** Keyboard focus shows it too, so it works without a mouse. */
export const OnFocus: Story = {
	tags: ['!manifest'],
	play: async ({ userEvent }) => {
		await userEvent.tab();
		await expect(await screen.findByRole('tooltip')).toHaveTextContent('Add to library');
	},
};
