import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui/components/hover-card';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen } from 'storybook/test';

/**
 * A preview that appears while the pointer rests on (or keyboard focus reaches) a link, such as a
 * user's profile card. It is supplemental: anything in it must also be reachable another way,
 * since touch users can't hover. HoverCardContent takes `align` and `sideOffset`. Built on Radix
 * HoverCard: `openDelay` (700 ms) and `closeDelay` (300 ms).
 *
 * @summary Hover preview for a link, such as a profile card; supplemental only
 */
const meta = {
	component: HoverCard,
	subcomponents: { HoverCardTrigger, HoverCardContent },
	args: { openDelay: 0 },
	render: (args) => (
		<HoverCard {...args}>
			<HoverCardTrigger asChild>
				<a href="https://nextjs.org" className="font-medium underline underline-offset-4">
					@nextjs
				</a>
			</HoverCardTrigger>
			<HoverCardContent className="w-72">
				<div className="grid gap-1">
					<p className="text-sm font-semibold">Next.js</p>
					<p className="text-sm">The React framework, created and maintained by Vercel.</p>
				</div>
			</HoverCardContent>
		</HoverCard>
	),
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hovering the link shows the card. */
export const Open: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.hover(canvas.getByRole('link', { name: '@nextjs' }));
		await expect(await screen.findByText('The React framework, created and maintained by Vercel.')).toBeVisible();
	},
};
