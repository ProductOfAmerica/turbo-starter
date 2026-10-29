import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

/**
 * Switches between panels of related content in place, one visible at a time. Compose a TabsList
 * of TabsTriggers and a TabsContent per panel, paired by `value`. TabsList takes `variant`:
 * `default` (a muted pill) or `line` (an underline). Arrow keys move between tabs and select them.
 * `orientation="vertical"` on Tabs stacks the list beside the panels, but only visually: this
 * wrapper doesn't pass `orientation` on to Radix, so the keys stay Left and Right. Use tabs for
 * views of one thing, not for site navigation or the steps of a flow. Built on Radix Tabs: `value`,
 * `defaultValue`, `onValueChange` and `activationMode` (`automatic` or `manual`).
 *
 * @summary Tabbed panels, one visible at a time, with keyboard navigation
 */
const meta = {
	component: Tabs,
	subcomponents: { TabsList, TabsTrigger, TabsContent },
	args: { defaultValue: 'account' },
	render: (args) => (
		<Tabs {...args} className="w-80">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
				<TabsTrigger value="billing">Billing</TabsTrigger>
			</TabsList>
			<TabsContent value="account">Update your name and email address.</TabsContent>
			<TabsContent value="password">Change your password.</TabsContent>
			<TabsContent value="billing">Manage your plan and invoices.</TabsContent>
		</Tabs>
	),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clicking a tab shows its panel and calls `onValueChange` with its value. */
export const Default: Story = {
	args: { onValueChange: fn() },
	play: async ({ args, canvas, userEvent }) => {
		await expect(canvas.getByRole('tabpanel', { name: 'Account' })).toBeVisible();
		await userEvent.click(canvas.getByRole('tab', { name: 'Password' }));
		await expect(canvas.getByRole('tab', { name: 'Password' })).toHaveAttribute('aria-selected', 'true');
		await expect(canvas.getByRole('tabpanel', { name: 'Password' })).toHaveTextContent('Change your password.');
		await expect(args.onValueChange).toHaveBeenCalledWith('password');
	},
};

/** The `line` variant underlines the selected tab instead of filling it. */
export const Line: Story = {
	render: (args) => (
		<Tabs {...args} className="w-80">
			<TabsList variant="line">
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
			</TabsList>
			<TabsContent value="account">Update your name and email address.</TabsContent>
			<TabsContent value="password">Change your password.</TabsContent>
		</Tabs>
	),
};

/**
 * The list stacked beside the panels. Layout only: the list still reports
 * `aria-orientation="horizontal"` and moves with the Left and Right arrows.
 */
export const Vertical: Story = { args: { orientation: 'vertical' } };

/** Arrow keys move focus along the list and select the focused tab (automatic activation). */
export const KeyboardNavigation: Story = {
	tags: ['!manifest'],
	play: async ({ canvas, userEvent }) => {
		await userEvent.tab();
		await expect(canvas.getByRole('tab', { name: 'Account' })).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		await expect(canvas.getByRole('tab', { name: 'Password' })).toHaveAttribute('aria-selected', 'true');
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
		await expect(canvas.getByRole('tab', { name: 'Billing' })).toHaveFocus();
	},
};

/** A disabled tab can't be selected, and arrow keys skip it. */
export const DisabledTab: Story = {
	render: (args) => (
		<Tabs {...args} className="w-80">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password" disabled>
					Password
				</TabsTrigger>
				<TabsTrigger value="billing">Billing</TabsTrigger>
			</TabsList>
			<TabsContent value="account">Update your name and email address.</TabsContent>
			<TabsContent value="password">Change your password.</TabsContent>
			<TabsContent value="billing">Manage your plan and invoices.</TabsContent>
		</Tabs>
	),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('tab', { name: 'Password' })).toBeDisabled();
		await userEvent.click(canvas.getByRole('tab', { name: 'Account' }));
		await userEvent.keyboard('{ArrowRight}');
		await expect(canvas.getByRole('tab', { name: 'Billing' })).toHaveFocus();
	},
};
