import { Button } from '@repo/ui/components/button';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@repo/ui/components/sheet';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, screen, waitFor } from 'storybook/test';

function SheetExample({ side }: { side?: 'top' | 'right' | 'bottom' | 'left' }) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline">Open filters</Button>
			</SheetTrigger>
			<SheetContent side={side}>
				<SheetHeader>
					<SheetTitle>Filters</SheetTitle>
					<SheetDescription>Narrow the list of projects.</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<SheetClose asChild>
						<Button>Apply</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

/**
 * A panel that slides in from an edge for secondary content, such as filters or mobile navigation.
 * It is a modal Dialog underneath: it renders in a portal, traps focus and closes on Escape.
 * SheetContent takes `side` (`top`, `right` default, `bottom`, `left`) and `showCloseButton`
 * (default true). Include a SheetTitle. Built on Radix Dialog: `open`, `onOpenChange`.
 *
 * @summary Edge panel (modal) for filters, details or mobile navigation
 */
const meta = {
	component: Sheet,
	subcomponents: { SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose },
	render: () => <SheetExample />,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Open filters' }));
		await expect(await screen.findByRole('dialog', { name: 'Filters' })).toBeVisible();
	},
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** From the right, the default when `side` is left out. */
export const Right: Story = {};

/** From the left, as for a navigation drawer. */
export const Left: Story = { render: () => <SheetExample side="left" /> };

/** From the top. */
export const Top: Story = { render: () => <SheetExample side="top" /> };

/** From the bottom. */
export const Bottom: Story = { render: () => <SheetExample side="bottom" /> };

/** SheetClose closes the sheet, here from the Apply button. */
export const CloseFromFooter: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Open filters' }));
		await userEvent.click(await screen.findByRole('button', { name: 'Apply' }));
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
	},
};
