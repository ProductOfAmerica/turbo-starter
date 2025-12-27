import { Button } from '@repo/ui/components/button';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center px-6">
			<div className="text-center space-y-6 max-w-md">
				<h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
				<h2 className="text-2xl font-semibold text-foreground">Page not found</h2>
				<p className="text-muted-foreground">
					Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
				</p>
				<Button asChild>
					<Link href="/">
						<Home className="w-4 h-4 mr-2" aria-hidden="true" />
						Back to Home
					</Link>
				</Button>
			</div>
		</div>
	);
}
