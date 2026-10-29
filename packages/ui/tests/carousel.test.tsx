import { CarouselNext } from '@repo/ui/components/carousel';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test } from 'vitest';

// React's act() warns unless the environment says it supports it.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

test('a carousel part outside <Carousel> throws', async () => {
	const root = createRoot(document.createElement('div'));
	await expect(act(async () => root.render(<CarouselNext />))).rejects.toThrow(
		'useCarousel must be used within a <Carousel />'
	);
});
