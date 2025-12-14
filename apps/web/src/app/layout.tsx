import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type React from 'react';
import { ThemeProvider } from './components/theme-provider';

import './globals.css';

const geistSans = localFont({
	src: './fonts/GeistVF.woff',
	variable: '--font-geist-sans',
});
const geistMono = localFont({
	src: './fonts/GeistMonoVF.woff',
	variable: '--font-geist-mono',
});

export const metadata: Metadata = {
	title: 'Turbo Starter',
	description: 'A production-ready monorepo starter with Next.js 16, Turborepo, and Shadcn UI.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable}`}>
				<meta name="apple-mobile-web-app-title" content="TurboStarter" />
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
