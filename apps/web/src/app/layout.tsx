import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { baseMetadata } from '@/lib/metadata';
import { siteConfig } from '@/lib/site-config';

import './globals.css';

const jsonLd = {
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

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
});
const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: I want to
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
