import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { FeaturesSection } from '@/components/sections/features-section';
import { features } from '@/lib/constants';

/**
 * The home page's #features section (Navbar links to it): a heading and a grid of Cards built from
 * `features` in lib/constants.tsx. Takes no props; add a feature there.
 *
 * @summary Home page grid of feature cards
 */
const meta = {
	component: FeaturesSection,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FeaturesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One card per entry in `features`. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { name: 'Everything you need to ship' })).toBeVisible();
		for (const feature of features) {
			await expect(canvas.getByText(feature.title)).toBeVisible();
		}
	},
};
