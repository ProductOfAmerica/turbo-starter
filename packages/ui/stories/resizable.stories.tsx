import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@repo/ui/components/resizable';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';

/**
 * Panels the user resizes by dragging the handle between them, such as an editor beside a
 * preview. Compose ResizablePanelGroup > ResizablePanel, with a ResizableHandle between each pair
 * (`withHandle` adds a visible grip). The group's `orientation` is `horizontal` (default) or
 * `vertical`. Built on react-resizable-panels 4: in `defaultSize`, `minSize` and `maxSize`, numbers
 * are pixels and strings carry a unit (`"50%"`; a bare `"50"` is also a percentage). ResizablePanel
 * takes `collapsible` and `onResize`; the group takes `onLayoutChanged`. The handle is a focusable
 * separator that arrow keys move.
 *
 * @summary Panels resized by dragging, or by arrow keys on the handle between them
 */
const meta = {
	component: ResizablePanelGroup,
	subcomponents: { ResizablePanel, ResizableHandle },
	render: (args) => (
		<ResizablePanelGroup {...args} className="min-h-48 max-w-md rounded-lg border">
			<ResizablePanel defaultSize="50%">
				<div className="flex h-full items-center justify-center p-6 font-semibold">Editor</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize="50%">
				<div className="flex h-full items-center justify-center p-6 font-semibold">Preview</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	),
} satisfies Meta<typeof ResizablePanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Side by side. With the handle focused, the arrow keys resize the panels. */
export const Horizontal: Story = {
	play: async ({ canvas, userEvent }) => {
		const handle = canvas.getByRole('separator');
		await userEvent.tab();
		await expect(handle).toHaveFocus();
		const before = Number(handle.getAttribute('aria-valuenow'));
		await userEvent.keyboard('{ArrowRight}');
		await waitFor(() => expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(before));
	},
};

/** `orientation="vertical"` stacks the panels. */
export const Vertical: Story = {
	args: { orientation: 'vertical' },
	render: (args) => (
		<ResizablePanelGroup {...args} className="min-h-64 max-w-md rounded-lg border">
			<ResizablePanel defaultSize="30%">
				<div className="flex h-full items-center justify-center p-6 font-semibold">Header</div>
			</ResizablePanel>
			<ResizableHandle />
			<ResizablePanel defaultSize="70%">
				<div className="flex h-full items-center justify-center p-6 font-semibold">Content</div>
			</ResizablePanel>
		</ResizablePanelGroup>
	),
};
