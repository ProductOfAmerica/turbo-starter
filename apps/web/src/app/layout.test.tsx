import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import { baseMetadata } from '@/lib/metadata';
import { baseViewport } from '@/lib/viewport';
import RootLayout, { metadata, viewport } from './layout';

// next/font/local only works inside Next.js's compiler; give each font a stable class name instead.
vi.mock('next/font/local', () => ({
	default: (options: { variable: string }) => ({ variable: options.variable.replace(/^--/, '') }),
}));
vi.mock('@vercel/analytics/react', () => ({ Analytics: () => null }));

test('wraps the page in the theme provider, fonts and structured data', () => {
	const html = renderToStaticMarkup(
		<RootLayout>
			<main>page</main>
		</RootLayout>
	);
	expect(html).toMatch(/^<html lang="en">/);
	expect(html).toContain('<body class="font-geist-sans font-geist-mono">');
	expect(html).toContain('<script type="application/ld+json">');
	expect(html).toContain('<main>page</main>');
});

test('exports the shared metadata and viewport', () => {
	expect(metadata).toBe(baseMetadata);
	expect(viewport).toBe(baseViewport);
});
