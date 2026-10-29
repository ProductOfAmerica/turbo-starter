import {
	Avatar,
	AvatarBadge,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
} from '@repo/ui/components/avatar';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

/**
 * A user's picture in a circle, with a fallback (usually initials) shown while the image loads or
 * if it fails. Compose AvatarImage (give it `alt`) and AvatarFallback. `size` is `sm`, `default` or
 * `lg`. AvatarBadge adds a status dot (put screen-reader text inside it); AvatarGroup overlaps
 * several avatars, and AvatarGroupCount ends the group with a count. Built on Radix Avatar:
 * AvatarFallback takes `delayMs`.
 *
 * @summary Circular user picture with an initials fallback
 */
const meta = {
	component: Avatar,
	subcomponents: { AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount },
	render: (args) => (
		<Avatar {...args}>
			<AvatarImage src="/web-app-manifest-192x192.png" alt="Turbo Starter" />
			<AvatarFallback>TS</AvatarFallback>
		</Avatar>
	),
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('img', { name: 'Turbo Starter' })).toBeVisible();
	},
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The image, once it loads. */
export const Default: Story = {};

/** `size="sm"`. */
export const Small: Story = { args: { size: 'sm' } };

/** `size="lg"`. */
export const Large: Story = { args: { size: 'lg' } };

/** Without an image (or before it loads), AvatarFallback shows the initials. */
export const Fallback: Story = {
	render: (args) => (
		<Avatar {...args}>
			<AvatarFallback>AL</AvatarFallback>
		</Avatar>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('AL')).toBeVisible();
	},
};

/** AvatarBadge marks a status, with its meaning in screen-reader text. */
export const WithBadge: Story = {
	render: (args) => (
		<Avatar {...args}>
			<AvatarImage src="/web-app-manifest-192x192.png" alt="Turbo Starter" />
			<AvatarFallback>TS</AvatarFallback>
			<AvatarBadge>
				<span className="sr-only">Online</span>
			</AvatarBadge>
		</Avatar>
	),
};

/** AvatarGroup overlaps avatars; AvatarGroupCount stands for the rest. */
export const Group: Story = {
	render: (args) => (
		<AvatarGroup>
			<Avatar {...args}>
				<AvatarFallback>AL</AvatarFallback>
			</Avatar>
			<Avatar {...args}>
				<AvatarFallback>GH</AvatarFallback>
			</Avatar>
			<Avatar {...args}>
				<AvatarFallback>KJ</AvatarFallback>
			</Avatar>
			<AvatarGroupCount>+3</AvatarGroupCount>
		</AvatarGroup>
	),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('+3')).toBeVisible();
	},
};
