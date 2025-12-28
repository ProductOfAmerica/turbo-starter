import type { WebSite, WithContext } from 'schema-dts';
import { siteConfig } from '@/lib/site-config';

const jsonLd: WithContext<WebSite> = {
	'@context': 'https://schema.org',
	'@type': 'WebSite',
	name: siteConfig.name,
	description: siteConfig.description,
	url: siteConfig.url,
	author: {
		'@type': 'Person',
		name: siteConfig.author.name,
		url: siteConfig.author.url,
	},
};

export function StructuredData() {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: I want to
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}
