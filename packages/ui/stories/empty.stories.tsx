import { Button } from '@repo/ui/components/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@repo/ui/components/empty';
import type { Meta, StoryObj } from '@storybook/react';
import { FolderIcon } from 'lucide-react';

/**
 * Fills a page or panel that has nothing to show yet, such as an empty project list, and points to
 * the next step. Compose EmptyHeader (EmptyMedia, EmptyTitle, EmptyDescription) and EmptyContent
 * for actions. EmptyMedia's `variant` is `default` or `icon` (an icon on a muted tile). Empty has a
 * dashed border style but no border width: add `border` to show it. EmptyTitle is a `<div>`.
 * Forwards native `<div>` attributes.
 *
 * @summary Placeholder for an empty page or list, with a next step
 */
const meta = {
	component: Empty,
	subcomponents: { EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent },
	render: (args) => (
		<Empty {...args}>
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<FolderIcon />
				</EmptyMedia>
				<EmptyTitle>No projects yet</EmptyTitle>
				<EmptyDescription>Create your first project to get started.</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button>Create project</Button>
			</EmptyContent>
		</Empty>
	),
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An icon, a title, a description and an action. */
export const Default: Story = {};

/** `border` shows the dashed outline. */
export const Outlined: Story = { args: { className: 'border' } };

/** EmptyMedia's `default` variant places a bare illustration or icon without the muted tile. */
export const PlainMedia: Story = {
	render: (args) => (
		<Empty {...args}>
			<EmptyHeader>
				<EmptyMedia>
					<FolderIcon className="size-10 text-muted-foreground" />
				</EmptyMedia>
				<EmptyTitle>No projects yet</EmptyTitle>
				<EmptyDescription>Create your first project to get started.</EmptyDescription>
			</EmptyHeader>
		</Empty>
	),
};
