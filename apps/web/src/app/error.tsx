'use client';

import { Button } from '@repo/ui/components/button';
import { RefreshCw } from 'lucide-react';

export default function ErrorPage({
	reset,
}: {
	/** Error thrown while rendering the route segment, passed in by Next.js. `digest` is an identifier that can be matched to server logs. This page does not read it. */
	error: Error & { digest?: string };
	/** Passed in by Next.js. Re-renders the segment to recover from the error; the Try again button calls it. */
	reset: () => void;
}) {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center px-6">
			<div className="text-center space-y-6 max-w-md">
				<h1 className="text-6xl font-bold text-muted-foreground/20">Error</h1>
				<h2 className="text-2xl font-semibold text-foreground">Something went wrong</h2>
				<p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
				<Button onClick={() => reset()}>
					<RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
					Try again
				</Button>
			</div>
		</div>
	);
}
