import { Card, CardContent, CardHeader } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';

function StatCardSkeleton() {
	return (
		<Card>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-4 w-4" />
				</div>
				<Skeleton className="mt-2 h-8 w-24" />
				<Skeleton className="mt-1 h-3 w-32" />
			</CardContent>
		</Card>
	);
}

function StatsCardsSkeleton() {
	return (
		<div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			{['pnl', 'model', 'market', 'edge', 'position', 'activity'].map((id) => (
				<StatCardSkeleton key={id} />
			))}
		</div>
	);
}

function ChartSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-8 w-48" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-[300px] w-full" />
			</CardContent>
		</Card>
	);
}

function FeedSkeleton() {
	return (
		<Card className="h-[400px]">
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<Skeleton className="h-5 w-24" />
					<Skeleton className="h-5 w-16" />
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{['item-1', 'item-2', 'item-3', 'item-4', 'item-5'].map((id) => (
					<div key={id} className="flex items-center gap-3">
						<Skeleton className="h-8 w-8 rounded-full" />
						<div className="flex-1 space-y-1.5">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-3 w-2/3" />
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}

export default function DashboardLoading() {
	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
				<div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
					<div className="flex items-center gap-4">
						<Skeleton className="h-6 w-6" />
						<Skeleton className="h-5 w-48" />
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-64" />
						<Skeleton className="h-9 w-9" />
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl flex-1 space-y-6 overflow-auto p-6">
				<div className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4">
					<div className="flex items-center gap-4">
						<Skeleton className="h-2.5 w-2.5 rounded-full" />
						<div className="space-y-1">
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-3 w-32" />
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-20" />
						<Skeleton className="h-9 w-20" />
					</div>
				</div>

				<StatsCardsSkeleton />
				<ChartSkeleton />

				<div className="grid gap-6 lg:grid-cols-2">
					<FeedSkeleton />
					<FeedSkeleton />
				</div>
			</main>
		</div>
	);
}
