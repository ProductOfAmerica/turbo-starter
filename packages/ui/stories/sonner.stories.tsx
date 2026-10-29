import { Button } from '@repo/ui/components/button';
import { Toaster } from '@repo/ui/components/sonner';
import type { Meta, StoryObj } from '@storybook/react';
import { toast } from 'sonner';
import { expect, screen } from 'storybook/test';

/**
 * Brief, non-blocking notifications (built on sonner). Render one Toaster near the root of the app,
 * then call `toast()` from the `sonner` package anywhere: `toast('Saved')`, `toast.success`,
 * `toast.error`, `toast.warning`, `toast.info`, `toast.promise`, with options such as `description`
 * and `action`. The Toaster follows the app theme through next-themes and takes sonner's props,
 * such as `position`. Don't put anything a user must act on only in a toast.
 *
 * @summary App-wide toast notifications; render one Toaster, call toast() from sonner
 */
const meta = {
	component: Toaster,
	render: (args) => (
		<>
			<Toaster {...args} />
			<div className="flex flex-wrap gap-2">
				<Button
					variant="outline"
					onClick={() => toast('Event created', { description: 'Sunday, January 4 at 9:00 AM' })}
				>
					Default
				</Button>
				<Button variant="outline" onClick={() => toast.success('Profile saved')}>
					Success
				</Button>
				<Button variant="outline" onClick={() => toast.error('Payment failed')}>
					Error
				</Button>
				<Button
					variant="outline"
					onClick={() => toast('Message archived', { action: { label: 'Undo', onClick: () => {} } })}
				>
					With action
				</Button>
			</div>
		</>
	),
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A toast with a description. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Default' }));
		await expect(await screen.findByText('Event created')).toBeVisible();
		await expect(screen.getByText('Sunday, January 4 at 9:00 AM')).toBeVisible();
	},
};

/** `toast.success` adds a check icon. */
export const Success: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Success' }));
		await expect(await screen.findByText('Profile saved')).toBeVisible();
	},
};

/** A toast with an action button, such as Undo. */
export const WithAction: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'With action' }));
		await expect(await screen.findByRole('button', { name: 'Undo' })).toBeVisible();
	},
};
