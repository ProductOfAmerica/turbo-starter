import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuIndicator,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from '@repo/ui/components/navigation-menu';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';

const guides = [
	{ title: 'Introduction', description: 'What the starter includes and how it fits together.' },
	{ title: 'Installation', description: 'Clone the template and run it locally.' },
	{ title: 'Deployment', description: 'Ship the app with Docker or Vercel.' },
];

/**
 * Site navigation: a row of top-level items. A NavigationMenuTrigger opens a NavigationMenuContent
 * panel of links; a plain top-level link is a NavigationMenuLink styled with
 * `navigationMenuTriggerStyle()`. Panels open on hover or click, and arrow keys move between items.
 * By default the panels share one animated viewport under the list; `viewport={false}` drops each
 * panel under its own trigger. NavigationMenuLink takes `active` (sets `aria-current="page"`) and
 * `asChild` (wrap next/link). NavigationMenuIndicator, placed in the list, adds an arrow that
 * tracks the open trigger. For a menu of actions use DropdownMenu. Built on Radix NavigationMenu:
 * `value`, `defaultValue`, `onValueChange` and `delayDuration` (200 ms).
 *
 * @summary Site navigation bar whose items open panels of links
 */
const meta = {
	component: NavigationMenu,
	subcomponents: {
		NavigationMenuList,
		NavigationMenuItem,
		NavigationMenuTrigger,
		NavigationMenuContent,
		NavigationMenuLink,
		NavigationMenuIndicator,
	},
	// a11y exception, aria-hidden-focus: an open panel adds a focusable, aria-hidden <span> that Radix
	// uses to move Tab focus into the panel. Only that proxy is skipped.
	parameters: {
		a11y: {
			config: { rules: [{ id: 'aria-hidden-focus', selector: '[aria-hidden="true"]:not(span[tabindex="0"])' }] },
		},
	},
	render: (args) => (
		<NavigationMenu {...args}>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-96 gap-1">
							{guides.map((guide) => (
								<li key={guide.title}>
									<NavigationMenuLink href="#" className="flex-col items-start gap-1">
										<span className="font-medium">{guide.title}</span>
										<span className="text-muted-foreground">{guide.description}</span>
									</NavigationMenuLink>
								</li>
							))}
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Components</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-48 gap-1">
							<li>
								<NavigationMenuLink href="#">Button</NavigationMenuLink>
							</li>
							<li>
								<NavigationMenuLink href="#">Dialog</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink href="#" active className={navigationMenuTriggerStyle()}>
						Docs
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	),
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clicking a trigger opens its panel; Escape closes it and returns focus to the trigger. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Getting started' });
		await userEvent.click(trigger);
		await expect(await canvas.findByRole('link', { name: /Installation/ })).toBeVisible();
		await expect(trigger).toHaveAttribute('aria-expanded', 'true');
		await userEvent.keyboard('{Escape}');
		await waitFor(() => expect(canvas.queryByRole('link', { name: /Installation/ })).not.toBeInTheDocument());
		await expect(trigger).toHaveFocus();
	},
};

/** `viewport={false}` renders each panel directly under its own trigger. */
export const WithoutViewport: Story = {
	args: { viewport: false },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Components' }));
		await expect(await canvas.findByRole('link', { name: 'Dialog' })).toBeVisible();
	},
};

/** Arrow keys move between top-level items, and Enter opens the focused trigger's panel. */
export const KeyboardNavigation: Story = {
	tags: ['!manifest'],
	play: async ({ canvas, userEvent }) => {
		await userEvent.tab();
		await expect(canvas.getByRole('button', { name: 'Getting started' })).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		const components = canvas.getByRole('button', { name: 'Components' });
		await expect(components).toHaveFocus();
		await userEvent.keyboard('{Enter}');
		await expect(await canvas.findByRole('link', { name: 'Button' })).toBeVisible();
	},
};

/** An `active` link marks the current page. */
export const ActiveLink: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page');
	},
};

/**
 * NavigationMenuIndicator adds an arrow under the open trigger. Render it inside NavigationMenuList.
 *
 * @summary NavigationMenuIndicator adds an arrow under the open trigger
 */
export const WithIndicator: Story = {
	render: (args) => (
		<NavigationMenu {...args}>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Components</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-48 gap-1">
							<li>
								<NavigationMenuLink href="#">Button</NavigationMenuLink>
							</li>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuIndicator />
			</NavigationMenuList>
		</NavigationMenu>
	),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Components' }));
		await expect(await canvas.findByRole('link', { name: 'Button' })).toBeVisible();
	},
};
