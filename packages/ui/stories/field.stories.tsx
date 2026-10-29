import { Checkbox } from '@repo/ui/components/checkbox';
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSeparator,
	FieldSet,
	FieldTitle,
} from '@repo/ui/components/field';
import { Input } from '@repo/ui/components/input';
import { Switch } from '@repo/ui/components/switch';
import { Textarea } from '@repo/ui/components/textarea';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

/**
 * Lays out one form control with its label, description and error. Build forms from Field: wrap
 * related fields in FieldGroup, and group a set of options under FieldSet with a FieldLegend. Mark
 * a failing field with `data-invalid` on Field and `aria-invalid` on the control, then render
 * FieldError. For React Hook Form, render Field inside its Controller (there is no Form component).
 * `orientation` is `vertical` (default), `horizontal` (label beside the control) or `responsive`.
 *
 * @summary Form field layout: label, control, description and error; build forms from it
 */
const meta = {
	component: Field,
	subcomponents: {
		FieldContent,
		FieldDescription,
		FieldError,
		FieldGroup,
		FieldLabel,
		FieldLegend,
		FieldSeparator,
		FieldSet,
		FieldTitle,
	},
	render: (args) => (
		<Field {...args} className="w-80">
			<FieldLabel htmlFor="username">Username</FieldLabel>
			<Input id="username" placeholder="ada" aria-describedby="username-help" />
			<FieldDescription id="username-help">Shown on your public profile.</FieldDescription>
		</Field>
	),
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A label, a control and help text, stacked. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Username')).toHaveAccessibleDescription('Shown on your public profile.');
	},
};

/** A failing field: `data-invalid` on Field, `aria-invalid` on the control and a FieldError explaining why. */
export const Invalid: Story = {
	render: (args) => (
		<Field {...args} data-invalid className="w-80">
			<FieldLabel htmlFor="email">Email</FieldLabel>
			<Input id="email" defaultValue="ada@" aria-invalid aria-describedby="email-error" />
			<FieldError id="email-error">Enter a complete email address.</FieldError>
		</Field>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('alert')).toHaveTextContent('Enter a complete email address.');
	},
};

/** `horizontal` puts a checkbox or switch beside its label; FieldContent stacks a title and description. */
export const Horizontal: Story = {
	args: { orientation: 'horizontal' },
	render: (args) => (
		<Field {...args} className="w-96">
			<Switch id="marketing" />
			<FieldContent>
				<FieldLabel htmlFor="marketing">Marketing emails</FieldLabel>
				<FieldDescription>Product news, at most once a month.</FieldDescription>
			</FieldContent>
		</Field>
	),
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('switch', { name: 'Marketing emails' });
		await userEvent.click(toggle);
		await expect(toggle).toBeChecked();
	},
};

/**
 * A whole form section: FieldSet, FieldLegend, FieldGroup and a FieldSeparator between groups.
 *
 * @summary A form section built from FieldSet, FieldLegend, FieldGroup and FieldSeparator
 */
export const Form: Story = {
	render: () => (
		<form className="w-96">
			<FieldSet>
				<FieldLegend>Profile</FieldLegend>
				<FieldDescription>This information is visible to your team.</FieldDescription>
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor="name">Name</FieldLabel>
						<Input id="name" autoComplete="name" />
					</Field>
					<Field>
						<FieldLabel htmlFor="about">About</FieldLabel>
						<Textarea id="about" />
					</Field>
					<FieldSeparator />
					<Field orientation="horizontal">
						<Checkbox id="public" defaultChecked />
						<FieldLabel htmlFor="public">Make my profile public</FieldLabel>
					</Field>
				</FieldGroup>
			</FieldSet>
		</form>
	),
};

/**
 * FieldTitle is a non-label heading for a field whose control is not a form input, such as a card of options.
 *
 * @summary FieldTitle heads a field whose control isn't a form input
 */
export const Title: Story = {
	render: (args) => (
		<Field {...args} className="w-80">
			<FieldTitle>Notifications</FieldTitle>
			<FieldDescription>Choose how you hear from us.</FieldDescription>
		</Field>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Notifications')).toBeVisible();
	},
};

/** FieldSeparator with children shows a label on the line, such as "Or continue with". */
export const SeparatorWithText: Story = {
	render: () => (
		<FieldGroup className="w-80">
			<Field>
				<FieldLabel htmlFor="login-email">Email</FieldLabel>
				<Input id="login-email" type="email" />
			</Field>
			<FieldSeparator>Or continue with</FieldSeparator>
			<Field>
				<FieldLabel htmlFor="login-token">Access token</FieldLabel>
				<Input id="login-token" />
			</Field>
		</FieldGroup>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Or continue with')).toBeVisible();
	},
};

/**
 * FieldError can take a validation library's `errors` array instead of children. One error renders
 * as plain text, several as a list. Duplicate messages are shown once, and entries without a
 * message are skipped.
 *
 * @summary FieldError takes a validation library's `errors` array
 */
export const ErrorList: Story = {
	render: () => (
		<div className="flex w-80 flex-col gap-6">
			<FieldError aria-label="No errors" errors={[]} />
			<FieldError aria-label="One error" errors={[{ message: 'Password is required.' }]} />
			<FieldError
				aria-label="Several errors"
				errors={[
					{ message: 'At least 8 characters.' },
					{ message: 'At least one number.' },
					{ message: 'At least one number.' },
					{},
					undefined,
				]}
			/>
		</div>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('alert')).toHaveLength(2);
		await expect(canvas.getByRole('alert', { name: 'One error' })).toHaveTextContent('Password is required.');
		const several = canvas.getByRole('alert', { name: 'Several errors' });
		await expect(within(several).getAllByRole('listitem')).toHaveLength(2);
	},
};
