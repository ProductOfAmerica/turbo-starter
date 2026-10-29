import { Marker, MarkerContent, MarkerIcon } from '@repo/ui/components/marker';
import type { Meta, StoryObj } from '@storybook/react';
import { GitBranchIcon } from 'lucide-react';
import { expect } from 'storybook/test';

/**
 * A quiet note between chat turns, such as a status change, or a labelled divider such as
 * "Today". Compose an optional MarkerIcon (hidden from assistive tech) and MarkerContent.
 * `variant` is `default`, `separator` (lines on both sides of centered text) or `border` (a line
 * underneath). `asChild` renders it as your own element; links inside are underlined. shadcn's chat
 * rules use Marker for notes and dividers, not a Separator with a label.
 *
 * @summary Inline note or labelled divider between chat turns
 */
const meta = {
	component: Marker,
	subcomponents: { MarkerIcon, MarkerContent },
	render: (args) => (
		<Marker {...args} className="w-96">
			<MarkerIcon>
				<GitBranchIcon />
			</MarkerIcon>
			<MarkerContent>Switched to the feat/storybook branch</MarkerContent>
		</Marker>
	),
} satisfies Meta<typeof Marker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An icon and a note. */
export const Default: Story = {};

/** `variant="separator"`: a centered label between two lines. */
export const Separator: Story = {
	args: { variant: 'separator' },
	render: (args) => (
		<Marker {...args} className="w-96">
			<MarkerContent>Today</MarkerContent>
		</Marker>
	),
};

/** `variant="border"`: a line underneath. */
export const Border: Story = { args: { variant: 'border' } };

/**
 * `asChild` renders the marker as your own element, here a link to the branch; the link is underlined.
 *
 * @summary `asChild` renders the marker as a link
 */
export const AsLink: Story = {
	render: (args) => (
		<Marker {...args} asChild className="w-96">
			<a href="#branch">
				<MarkerIcon>
					<GitBranchIcon />
				</MarkerIcon>
				<MarkerContent>Switched to the feat/storybook branch</MarkerContent>
			</a>
		</Marker>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link')).toHaveAttribute('data-slot', 'marker');
	},
};
