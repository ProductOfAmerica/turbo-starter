import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type React from 'react';
import { StructuredData } from '@/components/structured-data';
import { ThemeProvider } from '@/components/theme-provider';
import { WebVitals } from '@/components/web-vitals';
import { baseMetadata } from '@/lib/metadata';
import { baseViewport } from '@/lib/viewport';

import './globals.css';

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
	display: 'swap',
	preload: false,
});
const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
	display: 'swap',
	preload: false,
});

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = baseViewport;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<StructuredData />
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
				<WebVitals />
				<Analytics />
			</body>
		</html>
	);
}
