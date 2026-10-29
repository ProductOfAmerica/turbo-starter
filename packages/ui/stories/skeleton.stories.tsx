import { Skeleton } from '@repo/ui/components/skeleton';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * A pulsing placeholder that holds the place of content while it loads. Size and shape it with
 * `className`, such as `h-4 w-48` for a line of text or `size-10 rounded-full` for an avatar.
 * Forwards native `<div>` attributes.
 *
 * @summary Pulsing placeholder for loading content
 */
const meta = {
	component: Skeleton,
	args: { className: 'h-4 w-48' },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One line of text. */
export const Default: Story = {};

/** Skeletons shaped like the profile row they stand in for. */
export const ProfileRow: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<Skeleton className="size-10 rounded-full" />
			<div className="grid gap-2">
				<Skeleton className="h-4 w-48" />
				<Skeleton className="h-4 w-32" />
			</div>
		</div>
	),
};
