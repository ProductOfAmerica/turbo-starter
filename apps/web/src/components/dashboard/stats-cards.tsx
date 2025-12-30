'use client';

import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { cn } from '@repo/ui/lib/utils';
import { Activity, Brain, DollarSign, TrendingUp, Wallet, Zap } from 'lucide-react';

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
			{['pnl', 'model', 'market', 'edge', 'position', 'activity'].map((id) => (
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
	modelProbabilityDelta,
	yesPrice,
	noPrice,
	edge,
	edgeThreshold,
	position,
	exposure,
	eventCount,
	isLoading = false,
}: StatsCardsProps) {
	if (isLoading) {
		return <StatsCardsSkeleton />;
	}

	const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;
	const isPositive = pnl >= 0;
	const isTradeable = Math.abs(edge) >= edgeThreshold;
	const teamFavored = modelProbability > 0.5 ? 'Blue' : 'Red';
	const positionDirection = getPositionDirection(position);

	return (
		<div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			{/* P&L Card */}
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

			{/* Model Probability Card */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">Model</span>
						<Brain className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="mt-2 text-2xl font-bold font-mono tabular-nums">{formatPercent(modelProbability)}</div>
					<div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
						<span className={cn('h-2 w-2 rounded-full', modelProbability > 0.5 ? 'bg-blue-500' : 'bg-red-500')} />
						<span>{teamFavored} favored</span>
						<span
							className={cn(
								'ml-auto font-mono tabular-nums',
								modelProbabilityDelta > 0 ? 'text-green-600' : modelProbabilityDelta < 0 ? 'text-red-600' : ''
							)}
						>
							{modelProbabilityDelta > 0 ? '▲' : modelProbabilityDelta < 0 ? '▼' : ''}
							{modelProbabilityDelta !== 0 && formatPercent(Math.abs(modelProbabilityDelta))}
						</span>
					</div>
				</CardContent>
			</Card>

			{/* Market Price Card */}
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

			{/* Edge Card */}
			<Card className={cn(isTradeable && 'ring-2 ring-green-500/50')}>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">Edge</span>
						<Zap className={cn('h-4 w-4', isTradeable ? 'text-green-600' : 'text-muted-foreground')} />
					</div>
					<div className={cn('mt-2 text-2xl font-bold font-mono tabular-nums', isTradeable && 'text-green-600')}>
						{formatPercent(edge, true)}
					</div>
					<div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
						{isTradeable ? (
							<>
								<span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
								<span className="text-green-600 font-medium">Tradeable</span>
							</>
						) : (
							<span>Below {formatPercent(edgeThreshold)} threshold</span>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Position Card */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">Position</span>
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
						<span className="font-mono tabular-nums">${exposure.toFixed(2)}</span> exposure
					</div>
				</CardContent>
			</Card>

			{/* Activity Card */}
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">Activity</span>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</div>
					<div className="mt-2 text-2xl font-bold font-mono tabular-nums">{tradeCount}</div>
					<p className="mt-1 text-xs text-muted-foreground">
						trades today · <span className="font-mono tabular-nums">{eventCount}</span> events
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
