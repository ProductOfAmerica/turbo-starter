import { Button } from '@repo/ui/components/button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@repo/ui/components/button-group';
import { Input } from '@repo/ui/components/input';
import type { Meta, StoryObj } from '@storybook/react';
import { ArchiveIcon, ChevronDownIcon, ClockIcon, FlagIcon } from 'lucide-react';
import { expect } from 'storybook/test';

/**
 * Joins related buttons (or a button and an input) into one segmented control with shared borders.
 * Give the group an `aria-label` that names what the buttons act on. Use ToggleGroup instead when
 * the buttons pick a value rather than trigger actions. Forwards every native `<div>` attribute.
 *
 * @summary Segmented row or column of related buttons, text and inputs
 */
const meta = {
	component: ButtonGroup,
	subcomponents: { ButtonGroupText, ButtonGroupSeparator },
	args: { 'aria-label': 'Message actions' },
	render: (args) => (
		<ButtonGroup {...args}>
			<Button variant="outline">
				<ArchiveIcon data-icon="inline-start" />
				Archive
			</Button>
			<Button variant="outline">
				<FlagIcon data-icon="inline-start" />
				Report
			</Button>
			<Button variant="outline">
				<ClockIcon data-icon="inline-start" />
				Snooze
			</Button>
		</ButtonGroup>
	),
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A row of actions that apply to the same object. */
export const Default: Story = {
	play: async ({ canvas }) => {
		const group = canvas.getByRole('group', { name: 'Message actions' });
		await expect(group).toContainElement(canvas.getByRole('button', { name: 'Snooze' }));
	},
};

/** Stack the buttons for narrow sidebars. */
export const Vertical: Story = { args: { orientation: 'vertical' } };

/**
 * Filled buttons have no border to share, so put a ButtonGroupSeparator between them. Here it
 * splits a primary action from the menu trigger next to it.
 */
export const WithSeparator: Story = {
	args: { 'aria-label': 'Publish' },
	render: (args) => (
		<ButtonGroup {...args}>
			<Button variant="secondary">Publish</Button>
			<ButtonGroupSeparator />
			<Button variant="secondary" size="icon" aria-label="More publish options">
				<ChevronDownIcon />
			</Button>
		</ButtonGroup>
	),
};

/** ButtonGroupText adds a static prefix or suffix, such as a URL scheme next to an input. */
export const WithTextAndInput: Story = {
	args: { 'aria-label': 'Website' },
	render: (args) => (
		<ButtonGroup {...args}>
			<ButtonGroupText>https://</ButtonGroupText>
			<Input aria-label="Domain" placeholder="example.com" />
			<Button variant="outline">Check</Button>
		</ButtonGroup>
	),
};

/** Groups nest: the outer group spaces its child groups apart instead of joining them. */
export const Nested: Story = {
	args: { 'aria-label': 'Pagination' },
	render: (args) => (
		<ButtonGroup {...args}>
			<ButtonGroup aria-label="Pages">
				<Button variant="outline">1</Button>
				<Button variant="outline">2</Button>
				<Button variant="outline">3</Button>
			</ButtonGroup>
			<ButtonGroup aria-label="Navigation">
				<Button variant="outline">Previous</Button>
				<Button variant="outline">Next</Button>
			</ButtonGroup>
		</ButtonGroup>
	),
};

/** `asChild` on ButtonGroupText renders your own element, here a label tied to the input. */
export const TextAsLabel: Story = {
	args: { 'aria-label': 'Website' },
	render: (args) => (
		<ButtonGroup {...args}>
			<ButtonGroupText asChild>
				<label htmlFor="domain">https://</label>
			</ButtonGroupText>
			<Input id="domain" placeholder="example.com" />
		</ButtonGroup>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('https://')).toBeVisible();
	},
};
