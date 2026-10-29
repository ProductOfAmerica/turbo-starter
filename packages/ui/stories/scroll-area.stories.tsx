import { ScrollArea, ScrollBar } from '@repo/ui/components/scroll-area';
import { Separator } from '@repo/ui/components/separator';
import type { Meta, StoryObj } from '@storybook/react';
import { Fragment } from 'react';
import { expect } from 'storybook/test';

const releases = Array.from({ length: 30 }, (_, index) => `v1.${30 - index}.0`);

/**
 * A fixed-size region that scrolls its content with slim scrollbars styled to match the theme,
 * such as a long list in a panel. Size it with `className`. It includes a vertical ScrollBar; for
 * horizontal scrolling put `<ScrollBar orientation="horizontal" />` inside it. Built on Radix
 * ScrollArea: `type` (`hover` by default) sets when the scrollbars show.
 *
 * @summary Fixed-size scrolling region with themed scrollbars
 */
const meta = {
	component: ScrollArea,
	subcomponents: { ScrollBar },
	render: (args) => (
		<ScrollArea {...args} className="h-72 w-48 rounded-md border">
			<div className="p-4">
				<p className="mb-4 text-sm font-medium">Releases</p>
				{releases.map((release) => (
					<Fragment key={release}>
						<div className="text-sm">{release}</div>
						<Separator className="my-2" />
					</Fragment>
				))}
			</div>
		</ScrollArea>
	),
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A list taller than its box scrolls vertically. */
export const Vertical: Story = {
	play: async ({ canvasElement }) => {
		const viewport = canvasElement.querySelector('[data-slot="scroll-area-viewport"]');
		await expect(viewport?.scrollHeight).toBeGreaterThan(viewport?.clientHeight ?? 0);
	},
};

/** A row wider than its box, with a horizontal ScrollBar. */
export const Horizontal: Story = {
	render: (args) => (
		<ScrollArea {...args} className="w-96 rounded-md border whitespace-nowrap">
			<div className="flex w-max gap-4 p-4">
				{releases.slice(0, 12).map((release) => (
					<div key={release} className="flex h-20 w-32 items-center justify-center rounded-md bg-muted text-sm">
						{release}
					</div>
				))}
			</div>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
	),
};
