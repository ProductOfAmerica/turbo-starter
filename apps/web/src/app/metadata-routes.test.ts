import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { siteConfig } from '@/lib/site-config';
import manifest from './manifest';
import robots from './robots';
import sitemap from './sitemap';

describe('manifest', () => {
	test('points at icons that exist in public/', () => {
		const icons = manifest().icons ?? [];
		expect(icons).toHaveLength(2);
		for (const icon of icons) {
			expect(existsSync(join(__dirname, '../../public', icon.src)), icon.src).toBe(true);
		}
	});
});

describe('robots', () => {
	test('allows everything and points at the sitemap', () => {
		const result = robots();
		expect(result.rules).toEqual({ userAgent: '*', allow: '/' });
		expect(result.sitemap).toBe(new URL('/sitemap.xml', siteConfig.url).href);
	});
});

describe('sitemap', () => {
	test('lists the home page', () => {
		const [home] = sitemap();
		expect(home?.url).toBe(siteConfig.url);
		expect(home?.lastModified).toBeInstanceOf(Date);
	});
});
