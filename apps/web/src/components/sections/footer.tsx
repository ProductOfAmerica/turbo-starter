import Link from 'next/link';

export function Footer() {
	return (
		<footer className="border-t border-border bg-background">
			<div className="container mx-auto px-6 py-6">
				<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
					<div className="flex flex-wrap items-center justify-center md:justify-start space-x-6 text-sm text-muted-foreground">
						<Link href="https://turbo.build" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
							Turborepo
						</Link>
						<Link href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
							Next.js
						</Link>
						<Link
							href="https://ui.shadcn.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground transition-colors"
						>
							Shadcn UI
						</Link>
					</div>
					<div className="text-sm text-muted-foreground text-center">
						Built by{' '}
						<Link
							href="https://github.com/ProductOfAmerica"
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
						>
							ProductOfAmerica
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
