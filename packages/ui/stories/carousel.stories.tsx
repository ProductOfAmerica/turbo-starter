import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@repo/ui/components/carousel';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor } from 'storybook/test';

const slides = [1, 2, 3, 4, 5];

/**
 * Shows a row of slides one (or a few) at a time, moved by the previous and next buttons, swipe,
 * or the Left and Right arrow keys. Compose CarouselContent of CarouselItems plus CarouselPrevious
 * and CarouselNext, which sit outside the edges, so leave room beside the carousel. Give Carousel
 * an `aria-label`, and each slide one such as "1 of 5". `orientation` is `horizontal` or
 * `vertical`; set slides per view with a `basis-*` class on CarouselItem. Built on Embla: `opts`
 * (such as `{ loop: true }`), `plugins` (such as autoplay) and `setApi`, which receives the Embla
 * API.
 *
 * @summary Slides shown a few at a time, with buttons, swipe and arrow keys
 */
const meta = {
	component: Carousel,
	subcomponents: { CarouselContent, CarouselItem, CarouselPrevious, CarouselNext },
	args: { 'aria-label': 'Featured slides' },
	render: (args) => (
		<Carousel {...args} className="mx-12 w-64">
			<CarouselContent>
				{slides.map((slide) => (
					<CarouselItem key={slide} aria-label={`${slide} of ${slides.length}`}>
						<div className="flex aspect-square items-center justify-center rounded-xl border text-4xl font-semibold">
							{slide}
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	),
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One slide at a time. Previous is disabled on the first slide; Left and Right arrows move too; other keys do nothing. */
export const Default: Story = {
	play: async ({ canvas, userEvent }) => {
		const previous = canvas.getByRole('button', { name: 'Previous slide' });
		await waitFor(() => expect(previous).toBeDisabled());
		await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
		await waitFor(() => expect(previous).toBeEnabled());
		await userEvent.keyboard('{ArrowLeft}');
		await waitFor(() => expect(previous).toBeDisabled());
		await userEvent.keyboard('{ArrowRight}');
		await waitFor(() => expect(previous).toBeEnabled());
		await userEvent.keyboard('{Home}');
		await expect(previous).toBeEnabled();
	},
};

/** `basis-1/3` on each item shows three slides at a time. */
export const ThreePerView: Story = {
	render: (args) => (
		<Carousel {...args} className="mx-12 w-96">
			<CarouselContent>
				{slides.map((slide) => (
					<CarouselItem key={slide} aria-label={`${slide} of ${slides.length}`} className="basis-1/3">
						<div className="flex aspect-square items-center justify-center rounded-xl border text-2xl font-semibold">
							{slide}
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	),
};

/** `orientation="vertical"` scrolls up and down; the buttons move above and below. */
export const Vertical: Story = {
	args: { orientation: 'vertical', opts: { align: 'start' } },
	render: (args) => (
		<Carousel {...args} className="my-12 w-64">
			<CarouselContent className="h-48">
				{slides.map((slide) => (
					<CarouselItem key={slide} aria-label={`${slide} of ${slides.length}`} className="basis-1/2">
						<div className="flex h-full items-center justify-center rounded-xl border text-2xl font-semibold">
							{slide}
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	),
};

/** `setApi` hands the Embla API to the parent, for example to show the current slide number. */
export const WithApi: Story = {
	args: { setApi: fn() },
	play: async ({ args, canvas, userEvent }) => {
		await waitFor(() => expect(args.setApi).toHaveBeenCalled());
		await userEvent.click(canvas.getByRole('button', { name: 'Next slide' }));
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Previous slide' })).toBeEnabled());
	},
};
