import { useIsMobile } from '@repo/ui/hooks/use-mobile';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test } from 'vitest';
import { page } from 'vitest/browser';

// React's act() warns unless the environment says it supports it.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// The query useIsMobile listens to: below its 768px breakpoint.
const MOBILE_QUERY = '(max-width: 767px)';

let isMobile: boolean | undefined;

function Probe() {
	isMobile = useIsMobile();
	return null;
}

// Resizes the test iframe to the other side of the breakpoint and waits for the query's change event.
// Change events reach the oldest MediaQueryList first, so the hook's listener has run by then:
// https://drafts.csswg.org/cssom-view/#evaluate-media-queries-and-report-changes
async function resizeAcrossBreakpoint(width: number) {
	const query = window.matchMedia(MOBILE_QUERY);
	const changed = new Promise((resolve) => query.addEventListener('change', resolve, { once: true }));
	await act(async () => {
		await page.viewport(width, 800);
		await changed;
	});
}

// Storybook resizes the page for the next story before it unmounts the last one, so the sidebar stories
// reach the hook's change listener only when the event happens to fire in between. This test waits for it.
test('follows the viewport across the breakpoint', async () => {
	await page.viewport(1024, 800);
	const root = createRoot(document.createElement('div'));
	await act(async () => root.render(<Probe />));
	expect(isMobile).toBe(false);

	await resizeAcrossBreakpoint(500);
	expect(isMobile).toBe(true);

	await resizeAcrossBreakpoint(1024);
	expect(isMobile).toBe(false);

	await act(async () => root.unmount());
});
