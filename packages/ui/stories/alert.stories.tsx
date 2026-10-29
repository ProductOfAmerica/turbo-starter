import { Alert, AlertAction, AlertDescription, AlertTitle } from '@repo/ui/components/alert';
import { Button } from '@repo/ui/components/button';
import type { Meta, StoryObj } from '@storybook/react';
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react';
import { expect } from 'storybook/test';

/**
 * A callout for a message the user should see now, such as a saved change or a failed payment. Put
 * an optional lucide icon first, then AlertTitle and AlertDescription; AlertAction pins a control
 * to the top right. `variant` is `default` or `destructive`. Alert has role="alert", so screen
 * readers announce it as soon as it renders: don't use it for static page content. Forwards native
 * `<div>` attributes.
 *
 * @summary Callout for an important message, with optional icon and action
 */
const meta = {
	component: Alert,
	subcomponents: { AlertTitle, AlertDescription, AlertAction },
	render: (args) => (
		<Alert {...args} className="w-96">
			<CheckCircle2Icon />
			<AlertTitle>Changes saved</AlertTitle>
			<AlertDescription>Your profile is up to date.</AlertDescription>
		</Alert>
	),
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An icon, title and description. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('alert')).toHaveTextContent('Changes saved');
	},
};

/** For errors and failed actions. */
export const Destructive: Story = {
	args: { variant: 'destructive' },
	render: (args) => (
		<Alert {...args} className="w-96">
			<AlertCircleIcon />
			<AlertTitle>Payment failed</AlertTitle>
			<AlertDescription>Check your card details and try again.</AlertDescription>
		</Alert>
	),
};

/** AlertAction places a control at the top right. */
export const WithAction: Story = {
	render: (args) => (
		<Alert {...args} className="w-96">
			<CheckCircle2Icon />
			<AlertTitle>Project archived</AlertTitle>
			<AlertDescription>You can restore it from settings.</AlertDescription>
			<AlertAction>
				<Button size="xs" variant="outline">
					Undo
				</Button>
			</AlertAction>
		</Alert>
	),
};
