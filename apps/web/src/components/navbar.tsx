import { Button } from '@repo/ui/components/button';
import Link from 'next/link';
import { MobileNavigation } from '@/components/mobile-navigation';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
	return (
		<nav className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
			<div className="container mx-auto px-4 sm:px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<MobileNavigation />
						<Button
							variant="ghost"
							size="sm"
							className="font-semibold text-muted-foreground hover:text-foreground transition-colors"
							asChild
						>
							<Link href="https://github.com/ProductOfAmerica/turbo-starter">turbo-starter</Link>
						</Button>
					</div>

					<div className="hidden md:flex items-center space-x-6">
						<Link
							href="#features"
							scroll={true}
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Features
						</Link>
						<Link
							href="#quick-start"
							scroll={true}
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							Quick Start
						</Link>
						<ThemeToggle />
					</div>
					<div className="flex md:hidden items-center space-x-6">
						<ThemeToggle />
					</div>
				</div>
			</div>
		</nav>
	);
}
