import { AspectRatio } from '@repo/ui/components/aspect-ratio';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

/**
 * Keeps its content at a fixed width-to-height ratio as the width changes, such as a 16:9 media
 * frame. Set `ratio` (width divided by height; 1 by default) and size the parent. Fill it with an
 * image or video, such as next/image with `fill` in the app. Built on Radix AspectRatio; forwards native
 * `<div>` attributes.
 *
 * @summary Box that keeps a fixed width-to-height ratio
 */
const meta = {
	component: AspectRatio,
	args: { ratio: 16 / 9 },
	render: (args) => (
		<div className="w-96">
			<AspectRatio {...args} className="overflow-hidden rounded-lg bg-muted">
				<img src="/og.webp" alt="Turbo Starter preview" className="size-full object-cover" />
			</AspectRatio>
		</div>
	),
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 16:9, the usual video shape. */
export const Widescreen: Story = {
	play: async ({ canvas }) => {
		const { width, height } = canvas.getByRole('img', { name: 'Turbo Starter preview' }).getBoundingClientRect();
		await expect(width / height).toBeCloseTo(16 / 9, 2);
	},
};

/** 1:1. */
export const Square: Story = {
	args: { ratio: 1 },
	play: async ({ canvas }) => {
		const { width, height } = canvas.getByRole('img', { name: 'Turbo Starter preview' }).getBoundingClientRect();
		await expect(width / height).toBeCloseTo(1, 2);
	},
};
