import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';
import { siteConfig } from '@/lib/site-config';
import { StructuredData } from './structured-data';

test('renders the site as schema.org WebSite JSON-LD', () => {
	const html = renderToStaticMarkup(<StructuredData />);
	const json = html.match(/^<script type="application\/ld\+json">(.*)<\/script>$/)?.[1];
	expect(JSON.parse(json ?? 'null')).toEqual({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: siteConfig.name,
		description: siteConfig.description,
		url: siteConfig.url,
		author: { '@type': 'Person', name: siteConfig.author.name, url: siteConfig.author.url },
	});
});
