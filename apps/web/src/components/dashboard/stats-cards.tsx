'use client';

import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';
import { Activity, ArrowDownUp, DollarSign, TrendingUp, Wallet, Zap } from 'lucide-react';

interface StatsCardsProps {
	pnl: number;
	tradeCount: number;
	winCount: number;
	modelProbability: number;
	modelProbabilityDelta: number;
	yesPrice: number | null;
	noPrice: number | null;
	edge: number;
	edgeThreshold: number;
	position: number;
	exposure: number;
	eventCount: number;
	bidPrice?: number | null;
	askPrice?: number | null;
	isLoading?: boolean;
}

function formatCurrency(value: number): string {
	const absValue = Math.abs(value);
	const sign = value >= 0 ? '+' : '-';
	return `${sign}$${absValue.toFixed(2)}`;
}

function formatPercent(value: number, showSign = false): string {
	const sign = showSign && value > 0 ? '+' : '';
	return `${sign}${(value * 100).toFixed(1)}%`;
}

function formatPrice(value: number): string {
	return `${(value * 100).toFixed(1)}¢`;
}

type PositionDirection = 'LONG' | 'SHORT' | 'FLAT';

function getPositionDirection(position: number): PositionDirection {
	if (position > 0) return 'LONG';
	if (position < 0) return 'SHORT';
	return 'FLAT';
}

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

export function StatsCardsSkeleton() {
	return (
		<div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			{['pnl', 'quotes', 'market', 'spread', 'position', 'activity'].map((id) => (
				<StatCardSkeleton key={id} />
			))}
		</div>
	);
}

export function StatsCards({
	pnl,
	tradeCount,
	winCount,
	modelProbability,
	yesPrice,
	noPrice,
	edge: _edge,
	edgeThreshold: _edgeThreshold,
	position,
	exposure,
	eventCount,
	bidPrice,
	askPrice,
	isLoading = false,
}: StatsCardsProps) {
	if (isLoading) {
		return <StatsCardsSkeleton />;
	}

	const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;
	const isPositive = pnl >= 0;
	const spread = bidPrice != null && askPrice != null ? askPrice - bidPrice : 0;
	const spreadBps = spread * 10000;
	const positionDirection = getPositionDirection(position);
	const inventoryPct = Math.abs(position) > 0 ? Math.min(100, (Math.abs(position) / 100) * 100) : 0;

	return (
		<div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			<Card className={cn('relative overflow-hidden', isPositive ? 'border-green-500/20' : 'border-red-500/20')}>
				<div className={cn('absolute inset-x-0 top-0 h-1', isPositive ? 'bg-green-500' : 'bg-red-500')} />
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">Total P&L</span>
						<TrendingUp className={cn('h-4 w-4', isPositive ? 'text-green-600' : 'text-red-600')} />
					</div>
					<div
						className={cn(
							'mt-2 text-2xl font-bold font-mono tabular-nums',
							isPositive ? 'text-green-600' : 'text-red-600'
						)}
					>
						{formatCurrency(pnl)}
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						<span className="font-mono tabular-nums">{tradeCount}</span> trades ·{' '}
						<span className="font-mono tabular-nums">{winRate.toFixed(0)}</span>% win rate
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">My Quotes</span>
						<ArrowDownUp className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="mt-2 flex items-baseline gap-2">
						<span className="text-lg font-bold font-mono tabular-nums text-green-600">
							{bidPrice != null ? formatPrice(bidPrice) : '--'}
						</span>
						<span className="text-muted-foreground">/</span>
						<span className="text-lg font-bold font-mono tabular-nums text-red-600">
							{askPrice != null ? formatPrice(askPrice) : '--'}
						</span>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Bid / Ask · Mid <span className="font-mono tabular-nums">{formatPercent(modelProbability)}</span>
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">Market</span>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="mt-2 text-2xl font-bold font-mono tabular-nums">
						{yesPrice !== null ? formatPrice(yesPrice) : '--'}
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						YES <span className="font-mono tabular-nums">{yesPrice !== null ? formatPrice(yesPrice) : '--'}</span>{' '}
						/ NO <span className="font-mono tabular-nums">{noPrice !== null ? formatPrice(noPrice) : '--'}</span>
					</p>
				</CardContent>
			</Card>

			<Card className={cn(spreadBps > 0 && 'ring-1 ring-blue-500/30')}>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">Spread</span>
						<Zap className={cn('h-4 w-4', spreadBps > 100 ? 'text-blue-600' : 'text-muted-foreground')} />
					</div>
					<div
						className={cn('mt-2 text-2xl font-bold font-mono tabular-nums', spreadBps > 100 && 'text-blue-600')}
					>
						{spreadBps.toFixed(0)} <span className="text-base font-normal">bps</span>
					</div>
					<div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
						<span>Edge per fill: </span>
						<span className="font-mono tabular-nums text-green-600">
							{spread > 0 ? `+${formatPrice(spread / 2)}` : '--'}
						</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">Inventory</span>
						<Wallet className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="mt-2 text-2xl font-bold font-mono tabular-nums">
						{Math.abs(position)} <span className="text-base font-normal">shares</span>
					</div>
					<div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
						<Badge
							variant="outline"
							className={cn(
								positionDirection === 'LONG' && 'border-green-500/50 text-green-600',
								positionDirection === 'SHORT' && 'border-red-500/50 text-red-600',
								positionDirection === 'FLAT' && 'border-muted-foreground/50 text-muted-foreground'
							)}
						>
							{positionDirection}
						</Badge>
						<div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
							<div
								className={cn(
									'h-full rounded-full transition-all',
									inventoryPct > 70 ? 'bg-amber-500' : 'bg-blue-500'
								)}
								style={{ width: `${inventoryPct}%` }}
							/>
						</div>
						<span className="font-mono tabular-nums">{inventoryPct.toFixed(0)}%</span>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">Activity</span>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="mt-2 text-2xl font-bold font-mono tabular-nums">{eventCount}</div>
					<p className="mt-1 text-xs text-muted-foreground">
						fills · <span className="font-mono tabular-nums">${exposure.toFixed(2)}</span> exposure
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
