import {
	Trace,
	TraceCollapsible,
	TraceCollapsibleContent,
	TraceCollapsibleTrigger,
	TraceDescription,
	TraceIcon,
	TraceLine,
	TraceTitle,
} from '@repo/ui/components/trace';
import type { Meta, StoryObj } from '@storybook/react';
import { FileIcon, SearchIcon, TerminalIcon } from 'lucide-react';
import { expect } from 'storybook/test';

/**
 * The steps an assistant takes while it works, such as reading files, calling tools or running
 * commands, as a list of lines. Each TraceLine holds a TraceIcon, a TraceTitle and an optional
 * TraceDescription; `status` is `running`, `error` or `pending` (leave it unset when done). To make
 * a line interactive, wrap it: TraceCollapsible with TraceCollapsibleTrigger and
 * TraceCollapsibleContent for details, or a link or button. Use one Trace per run of steps, Message
 * for the reply, and Marker for notes between turns (shadcn's chat rules).
 *
 * @summary Assistant activity log: steps with icons, status and expandable details
 */
const meta = {
	component: Trace,
	subcomponents: {
		TraceLine,
		TraceIcon,
		TraceTitle,
		TraceDescription,
		TraceCollapsible,
		TraceCollapsibleTrigger,
		TraceCollapsibleContent,
	},
	render: (args) => (
		<Trace {...args} className="w-96">
			<TraceLine>
				<TraceIcon>
					<FileIcon />
				</TraceIcon>
				<TraceTitle>Read button.tsx</TraceTitle>
			</TraceLine>
			<TraceLine>
				<TraceIcon>
					<SearchIcon />
				</TraceIcon>
				<TraceTitle>Searched for Button usages</TraceTitle>
			</TraceLine>
			<TraceLine status="running">
				<TraceIcon>
					<TerminalIcon />
				</TraceIcon>
				<TraceTitle>Running story tests</TraceTitle>
			</TraceLine>
		</Trace>
	),
} satisfies Meta<typeof Trace>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Finished steps, then one still running. */
export const Default: Story = {};

/** `status="error"` marks a failed step; `status="pending"` one that hasn't started. */
export const Statuses: Story = {
	// a11y exception, color-contrast: status="pending" fades the line to 60% opacity, under 4.5:1 in
	// both themes, by design in the CLI-written trace.tsx. Only text inside pending steps is skipped.
	parameters: {
		a11y: { config: { rules: [{ id: 'color-contrast', selector: '*:not([data-status="pending"] *)' }] } },
	},
	render: (args) => (
		<Trace {...args} className="w-96">
			<TraceLine status="error">
				<TraceIcon>
					<TerminalIcon />
				</TraceIcon>
				<TraceTitle>Build failed</TraceTitle>
			</TraceLine>
			<TraceLine status="pending">
				<TraceIcon>
					<TerminalIcon />
				</TraceIcon>
				<TraceTitle>Deploy preview</TraceTitle>
			</TraceLine>
		</Trace>
	),
};

/** TraceDescription adds a detail such as a duration. */
export const WithDescription: Story = {
	// a11y exception, color-contrast: TraceDescription is text-muted-foreground/70, under 4.5:1 in both
	// themes, by design in the CLI-written trace.tsx. Only the description is skipped.
	parameters: {
		a11y: { config: { rules: [{ id: 'color-contrast', selector: '*:not([data-slot="trace-description"])' }] } },
	},
	render: (args) => (
		<Trace {...args} className="w-96">
			<TraceLine>
				<TraceIcon>
					<TerminalIcon />
				</TraceIcon>
				<TraceTitle>Ran pnpm test</TraceTitle>
				<TraceDescription>42s</TraceDescription>
			</TraceLine>
		</Trace>
	),
};

/** A collapsible line expands to show the step's details. */
export const Collapsible: Story = {
	render: (args) => (
		<Trace {...args} className="w-96">
			<TraceCollapsible>
				<TraceCollapsibleTrigger>
					<TraceLine>
						<TraceIcon>
							<TerminalIcon />
						</TraceIcon>
						<TraceTitle>Ran the build</TraceTitle>
					</TraceLine>
				</TraceCollapsibleTrigger>
				<TraceCollapsibleContent>Compiled 3 packages with no errors.</TraceCollapsibleContent>
			</TraceCollapsible>
		</Trace>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Ran the build' }));
		await expect(canvas.getByText('Compiled 3 packages with no errors.')).toBeVisible();
	},
};
