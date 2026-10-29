import { Button } from '@repo/ui/components/button';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import type { Meta, StoryObj } from '@storybook/react';

/**
 * A bordered surface that groups related content and actions, such as a form or a summary. Compose
 * CardHeader (CardTitle, CardDescription, and an optional CardAction at the top right),
 * CardContent and CardFooter. A `border-b` class on the header or `border-t` on the footer adds a
 * divider with matching spacing. `size` is `default` or `sm` (tighter spacing). An image as the
 * first child runs to the card's top edge. CardTitle is a `<div>`: put a heading element inside it
 * when the card needs one in the page outline. Forwards native `<div>` attributes.
 *
 * @summary Bordered surface grouping a header, content and footer
 */
const meta = {
	component: Card,
	subcomponents: { CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter },
	render: (args) => (
		<Card {...args} className="w-80">
			<CardHeader>
				<CardTitle>Log in</CardTitle>
				<CardDescription>Enter your email to continue.</CardDescription>
				<CardAction>
					<Button variant="link">Sign up</Button>
				</CardAction>
			</CardHeader>
			<CardContent>
				<div className="grid gap-2">
					<Label htmlFor="card-email">Email</Label>
					<Input id="card-email" type="email" placeholder="you@example.com" />
				</div>
			</CardContent>
			<CardFooter>
				<Button className="w-full">Continue</Button>
			</CardFooter>
		</Card>
	),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Header with an action, content and footer. */
export const Default: Story = {};

/** `size="sm"` tightens the spacing. */
export const Small: Story = { args: { size: 'sm' } };

/** An image as the first child spans the card's top edge. */
export const WithImage: Story = {
	render: (args) => (
		<Card {...args} className="w-80">
			<img src="/og.webp" alt="Turbo Starter preview" width={1200} height={630} className="h-auto w-full" />
			<CardHeader>
				<CardTitle>Turbo Starter</CardTitle>
				<CardDescription>A Turborepo and Next.js template.</CardDescription>
			</CardHeader>
		</Card>
	),
};
