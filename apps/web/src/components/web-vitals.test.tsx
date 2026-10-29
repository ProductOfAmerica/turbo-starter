// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';
import { WebVitals } from './web-vitals';

const { track, handlers } = vi.hoisted(() => ({
	track: vi.fn(),
	handlers: new Map<string, (metric: unknown) => void>(),
}));

vi.mock('@vercel/analytics', () => ({ track }));
vi.mock('web-vitals', () =>
	Object.fromEntries(
		['onCLS', 'onINP', 'onFCP', 'onLCP', 'onTTFB'].map((name) => [
			name,
			(handler: (metric: unknown) => void) => handlers.set(name, handler),
		])
	)
);

// React's act() warns unless the environment says it supports it.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const metric = { name: 'LCP', value: 1200, id: 'v1', rating: 'good' };

async function mountWebVitals() {
	const root = createRoot(document.createElement('div'));
	await act(async () => root.render(<WebVitals />));
	return root;
}

afterEach(() => {
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
	track.mockClear();
	handlers.clear();
});

test('subscribes to every Core Web Vital and renders nothing', async () => {
	await mountWebVitals();
	expect([...handlers.keys()].sort()).toEqual(['onCLS', 'onFCP', 'onINP', 'onLCP', 'onTTFB']);
});

test('sends each metric to Vercel Analytics', async () => {
	await mountWebVitals();
	handlers.get('onLCP')?.(metric);
	expect(track).toHaveBeenCalledWith('Web Vital', { name: 'LCP', value: 1200, id: 'v1', rating: 'good' });
});

test('also logs metrics in development', async () => {
	vi.stubEnv('NODE_ENV', 'development');
	const log = vi.spyOn(console, 'log').mockImplementation(() => {});
	await mountWebVitals();
	handlers.get('onCLS')?.(metric);
	expect(log).toHaveBeenCalledWith('Web Vital:', metric);
});
