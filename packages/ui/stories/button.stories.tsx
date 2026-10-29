import { Button } from '@repo/ui/components/button';
import type { Meta, StoryObj } from '@storybook/react';
import { ArrowRightIcon, PlusIcon } from 'lucide-react';
import { expect, fn } from 'storybook/test';

/**
 * Triggers an action in place: submitting a form, opening a dialog, saving. For navigation, pass
 * `asChild` and put a link inside, so the element stays a link with the button's look.
 * Forwards every native `<button>` attribute, such as `type`, `disabled`, `onClick` and `aria-label`.
 *
 * @summary Action trigger in six variants and eight sizes; `asChild` styles a link instead
 */
const meta = {
	component: Button,
	args: { children: 'Save changes' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The main action of a view or form. Use one per screen so it stays obvious. */
export const Default: Story = {
	args: { onClick: fn() },
	play: async ({ args, canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }));
		await expect(args.onClick).toHaveBeenCalledOnce();
	},
};

/** A secondary action next to a primary one, such as Cancel. */
export const Outline: Story = { args: { variant: 'outline', children: 'Cancel' } };

/** A lower-emphasis action that still needs a filled shape. */
export const Secondary: Story = { args: { variant: 'secondary', children: 'Duplicate' } };

/** Toolbar and inline actions, where a border would add noise. */
export const Ghost: Story = { args: { variant: 'ghost', children: 'Edit' } };

/** Irreversible actions such as deleting data. Confirm them with an AlertDialog. */
export const Destructive: Story = {
	args: { variant: 'destructive', children: 'Delete project' },
};

/** An action that reads as text, for dense prose or table rows. */
export const Link: Story = { args: { variant: 'link', children: 'Learn more' } };

/** The text sizes, `xs` to `lg`. Keep one size per toolbar or form. */
export const Sizes: Story = {
	render: (args) => (
		<div className="flex items-center gap-2">
			<Button {...args} size="xs">
				Extra small
			</Button>
			<Button {...args} size="sm">
				Small
			</Button>
			<Button {...args} size="default">
				Default
			</Button>
			<Button {...args} size="lg">
				Large
			</Button>
		</div>
	),
};

/** Square icon-only sizes. With no visible text, each needs an `aria-label`. */
export const IconSizes: Story = {
	render: (args) => (
		<div className="flex items-center gap-2">
			<Button {...args} size="icon-xs" aria-label="Add item">
				<PlusIcon />
			</Button>
			<Button {...args} size="icon-sm" aria-label="Add item">
				<PlusIcon />
			</Button>
			<Button {...args} size="icon" aria-label="Add item">
				<PlusIcon />
			</Button>
			<Button {...args} size="icon-lg" aria-label="Add item">
				<PlusIcon />
			</Button>
		</div>
	),
};

/**
 * Icons go in `children`. `data-icon="inline-end"` (or `inline-start`) trims the padding on that side.
 *
 * @summary Icons go in `children`; `data-icon` trims the padding on their side
 */
export const WithIcon: Story = {
	args: {
		children: (
			<>
				Continue
				<ArrowRightIcon data-icon="inline-end" />
			</>
		),
	},
};

/** A disabled button ignores clicks and leaves the tab order. */
export const Disabled: Story = {
	args: { disabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Save changes' })).toBeDisabled();
	},
};

/**
 * `asChild` hands the button's styles to its only child, here a link, which keeps link semantics.
 *
 * @summary `asChild` styles a link as a button and keeps it a link
 */
export const AsLink: Story = {
	args: { asChild: true, children: <a href="#pricing">See pricing</a> },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'See pricing' })).toHaveAttribute('href', '#pricing');
	},
};

/**
 * Guards the preview setup rather than the button: `rounded-md` resolves through the `--radius`
 * token in packages/ui's globals.css, so this fails if Tailwind or the design tokens stop loading.
 */
export const CssCheck: Story = {
	tags: ['!autodocs', '!manifest'],
	play: async ({ canvas }) => {
		const button = canvas.getByRole('button', { name: 'Save changes' });
		await expect(getComputedStyle(button).borderTopLeftRadius).toBe('8px');
	},
};
