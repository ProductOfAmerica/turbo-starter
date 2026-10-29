import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
	InputGroupTextarea,
} from '@repo/ui/components/input-group';
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowUpIcon, CopyIcon, SearchIcon } from 'lucide-react';
import { expect } from 'storybook/test';

/**
 * An input or textarea with icons, text or buttons attached inside the same border. Put the control
 * (InputGroupInput or InputGroupTextarea) and InputGroupAddon children in any order: `align` places
 * each addon `inline-start`, `inline-end`, `block-start` or `block-end`. Clicking an addon focuses the input.
 * The control needs its own accessible name, such as an `aria-label`.
 *
 * @summary Input or textarea with attached icons, text and buttons
 */
const meta = {
	component: InputGroup,
	subcomponents: { InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea },
	render: (args) => (
		<InputGroup {...args} className="w-80">
			<InputGroupInput aria-label="Search" placeholder="Search projects" />
			<InputGroupAddon>
				<SearchIcon />
			</InputGroupAddon>
		</InputGroup>
	),
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A leading icon marks the field's purpose. Clicking the icon focuses the input. */
export const Default: Story = {
	play: async ({ canvas, canvasElement, userEvent }) => {
		const icon = canvasElement.querySelector('[data-slot="input-group-addon"]');
		if (icon) await userEvent.click(icon);
		await expect(canvas.getByRole('textbox', { name: 'Search' })).toHaveFocus();
	},
};

/** Text prefixes and suffixes, such as a URL scheme and domain. */
export const WithText: Story = {
	render: (args) => (
		<InputGroup {...args} className="w-80">
			<InputGroupAddon>
				<InputGroupText>https://</InputGroupText>
			</InputGroupAddon>
			<InputGroupInput aria-label="Subdomain" placeholder="my-app" />
			<InputGroupAddon align="inline-end">
				<InputGroupText>.vercel.app</InputGroupText>
			</InputGroupAddon>
		</InputGroup>
	),
};

/**
 * An inline InputGroupButton acts on the input's value without leaving the field. It is a Button
 * (ghost, `xs` by default) with its own sizes: `xs`, `sm`, `icon-xs` and `icon-sm`.
 */
export const WithButton: Story = {
	render: (args) => (
		<InputGroup {...args} className="w-80">
			<InputGroupInput aria-label="API key" readOnly value="sk_live_51H8ab" />
			<InputGroupAddon align="inline-end">
				<InputGroupButton size="icon-xs" aria-label="Copy API key">
					<CopyIcon />
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	),
	play: async ({ canvas, userEvent }) => {
		// Clicking a button inside an addon leaves focus on the button instead of moving it to the input.
		await userEvent.click(canvas.getByRole('button', { name: 'Copy API key' }));
		await expect(canvas.getByRole('button', { name: 'Copy API key' })).toHaveFocus();
		await expect(canvas.getByRole('textbox', { name: 'API key' })).not.toHaveFocus();
	},
};

/** Without a `size`, InputGroupButton is `xs`: a compact text button. */
export const WithTextButton: Story = {
	render: (args) => (
		<InputGroup {...args} className="w-80">
			<InputGroupInput aria-label="Coupon code" placeholder="Coupon code" />
			<InputGroupAddon align="inline-end">
				<InputGroupButton variant="secondary">Apply</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Apply' })).toHaveAttribute('data-size', 'xs');
	},
};

/** A textarea with a toolbar below it, the layout of a chat composer. */
export const WithTextarea: Story = {
	render: (args) => (
		<InputGroup {...args} className="w-96">
			<InputGroupTextarea aria-label="Message" placeholder="Ask anything" />
			<InputGroupAddon align="block-end">
				<InputGroupText>Shift+Enter for a new line</InputGroupText>
				<InputGroupButton size="icon-xs" variant="default" className="ml-auto" aria-label="Send message">
					<ArrowUpIcon />
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	),
};

/** `aria-invalid` on the control turns the whole group's border destructive. */
export const Invalid: Story = {
	render: (args) => (
		<InputGroup {...args} className="w-80">
			<InputGroupInput aria-label="Search" aria-invalid defaultValue="?" />
			<InputGroupAddon>
				<SearchIcon />
			</InputGroupAddon>
		</InputGroup>
	),
};
