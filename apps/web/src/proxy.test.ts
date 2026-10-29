import { NextRequest } from 'next/server';
import { describe, expect, test } from 'vitest';
import { config, proxy } from './proxy';

describe('proxy', () => {
	const response = proxy(new NextRequest('https://example.com/'));

	test('passes the request on', () => {
		expect(response.headers.get('x-middleware-next')).toBe('1');
	});

	test('sets the security headers', () => {
		expect(response.headers.get('X-Frame-Options')).toBe('DENY');
		expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
		expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
		expect(response.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
		expect(response.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
	});

	test('allows only the expected third-party origins in the CSP', () => {
		const csp = response.headers.get('Content-Security-Policy') ?? '';
		const origins = new Set(csp.match(/https:\/\/[^\s;]+/g));
		expect([...origins].sort()).toEqual(['https://va.vercel-scripts.com', 'https://vitals.vercel-insights.com']);
		expect(csp).toContain("default-src 'self'");
		expect(csp).toContain("img-src 'self' data: blob:");
	});
});

describe('config.matcher', () => {
	// Next.js matchers are path-to-regexp patterns; this one is also a plain regular expression.
	const matches = (path: string) => new RegExp(`^${config.matcher[0]}$`).test(path);

	test('runs on pages', () => {
		expect(matches('/')).toBe(true);
		expect(matches('/about')).toBe(true);
	});

	test('skips static assets and Next.js internals', () => {
		for (const path of ['/_next/static/chunk.js', '/_next/image', '/favicon.ico', '/og.webp', '/styles.css']) {
			expect(matches(path), path).toBe(false);
		}
	});
});
