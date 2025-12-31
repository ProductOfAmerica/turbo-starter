'use client';

import { Button } from '@repo/ui/components/button';
import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error('Application error:', error);
	}, [error]);

	return (
		<div className="min-h-screen bg-background flex items-center justify-center px-6">
			<div className="text-center space-y-6 max-w-md">
				<h1 className="text-6xl font-bold text-muted-foreground/20">Error</h1>
				<h2 className="text-2xl font-semibold text-foreground">Something went wrong</h2>
				<p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
				{process.env.NODE_ENV === 'development' && error.digest && (
					<p className="text-xs text-muted-foreground font-mono">Digest: {error.digest}</p>
				)}
				<Button onClick={() => reset()}>
					<RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
					Try again
				</Button>
			</div>
		</div>
	);
}
