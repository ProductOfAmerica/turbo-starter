import { Badge } from '@repo/ui/components/badge';
import type { Meta, StoryObj } from '@storybook/react';
import { BadgeCheckIcon } from 'lucide-react';
import { expect } from 'storybook/test';

/**
 * A small label for a status, count or category, such as "New" or "3". `variant` is `default`,
 * `secondary`, `destructive`, `outline`, `ghost` or `link`. A lucide icon can go before or after
 * the text. `asChild` renders it as your own element, such as a link, which then gets a hover
 * style. Forwards native `<span>` attributes.
 *
 * @summary Small status, count or category label
 */
const meta = {
	component: Badge,
	args: { children: 'Badge' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The primary style. */
export const Default: Story = {};

/** A quieter fill. */
export const Secondary: Story = { args: { variant: 'secondary' } };

/** For errors and warnings. */
export const Destructive: Story = {
	args: { variant: 'destructive' },
};

/** A border and no fill. */
export const Outline: Story = { args: { variant: 'outline' } };

/** No fill until hovered. */
export const Ghost: Story = { args: { variant: 'ghost' } };

/** Styled like a link. */
export const Link: Story = { args: { variant: 'link' } };

/** An icon before the text. */
export const WithIcon: Story = {
	args: {
		variant: 'secondary',
		children: (
			<>
				<BadgeCheckIcon />
				Verified
			</>
		),
	},
};

/** `asChild` makes the badge a link. */
export const AsLink: Story = {
	args: { asChild: true, children: <a href="#releases">v2.0</a> },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'v2.0' })).toHaveAttribute('data-slot', 'badge');
	},
};
