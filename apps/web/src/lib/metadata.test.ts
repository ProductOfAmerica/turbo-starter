import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { baseMetadata } from './metadata';
import { siteConfig } from './site-config';
import { baseViewport } from './viewport';

const publicFile = (path: string) => join(__dirname, '../../public', path);

describe('siteConfig', () => {
	test('has an absolute URL and an image that exists in public/', () => {
		expect(new URL(siteConfig.url).protocol).toBe('https:');
		expect(existsSync(publicFile(siteConfig.ogImage))).toBe(true);
	});
});

describe('baseMetadata', () => {
	test('resolves relative URLs against the site URL', () => {
		expect(String(baseMetadata.metadataBase)).toBe(siteConfig.url);
	});

	test('titles pages after the site', () => {
		expect(baseMetadata.title).toEqual({ default: siteConfig.name, template: `%s | ${siteConfig.name}` });
	});

	test('shares the Open Graph image with Twitter', () => {
		expect(baseMetadata.openGraph?.images).toEqual([expect.objectContaining({ url: siteConfig.ogImage })]);
		expect(baseMetadata.twitter?.images).toEqual([siteConfig.ogImage]);
	});
});

describe('baseViewport', () => {
	test('sets a theme color for each color scheme', () => {
		expect(baseViewport.themeColor).toEqual([
			{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
			{ media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
		]);
	});
});
