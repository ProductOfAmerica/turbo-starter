import { Separator } from '@repo/ui/components/separator';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

/**
 * A thin line that divides content: horizontal by default, or `orientation="vertical"` inside a
 * row (give the row a height). It's decorative by default, so assistive tech skips it; set
 * `decorative={false}` when the division carries meaning, which exposes role="separator". Built on
 * Radix Separator.
 *
 * @summary Thin horizontal or vertical divider line
 */
const meta = {
	component: Separator,
	render: (args) => (
		<div className="w-72 text-sm">
			<p className="font-medium">Turbo Starter</p>
			<p className="text-muted-foreground">A Turborepo and Next.js template.</p>
			<Separator {...args} className="my-4" />
			<p>Apps and packages share one toolchain.</p>
		</div>
	),
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Between blocks of text. Decorative, so it isn't announced. */
export const Horizontal: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('separator')).not.toBeInTheDocument();
	},
};

/** Between items in a row. */
export const Vertical: Story = {
	args: { orientation: 'vertical' },
	render: (args) => (
		<div className="flex h-5 items-center gap-4 text-sm">
			<span>Docs</span>
			<Separator {...args} />
			<span>Source</span>
			<Separator {...args} />
			<span>Changelog</span>
		</div>
	),
};

/** `decorative={false}` exposes it as a separator. */
export const Semantic: Story = {
	args: { decorative: false },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('separator')).toBeInTheDocument();
	},
};
