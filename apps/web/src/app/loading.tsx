export default function Loading() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center">
			<div className="flex flex-col items-center space-y-4">
				<div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
				<p className="text-muted-foreground text-sm">Loading...</p>
			</div>
		</div>
	);
}
