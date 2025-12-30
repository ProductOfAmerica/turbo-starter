'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Activity, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { formatProbability, formatPrice } from '@/services/trade-evaluator';

interface StatsCardsProps {
	posterior: number;
	yesPrice: number | null;
	noPrice: number | null;
	eventCount: number;
	tradeCount: number;
}

export function StatsCards({ posterior, yesPrice, noPrice, eventCount, tradeCount }: StatsCardsProps) {
	const edge = yesPrice !== null ? posterior - yesPrice : 0;

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Model Probability</CardTitle>
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{formatProbability(posterior)}</div>
					<p className="text-xs text-muted-foreground">Blue/Radiant win probability</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Market Price</CardTitle>
					<DollarSign className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">
						{yesPrice !== null ? formatPrice(yesPrice) : '--'}
					</div>
					<p className="text-xs text-muted-foreground">
						YES: {yesPrice !== null ? formatPrice(yesPrice) : '--'} / NO:{' '}
						{noPrice !== null ? formatPrice(noPrice) : '--'}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Current Edge</CardTitle>
					<Zap className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className={`text-2xl font-bold ${edge > 0.05 ? 'text-green-500' : edge < -0.05 ? 'text-red-500' : ''}`}>
						{edge > 0 ? '+' : ''}
						{(edge * 100).toFixed(2)}%
					</div>
					<p className="text-xs text-muted-foreground">Model vs Market difference</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Activity</CardTitle>
					<Activity className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold">{eventCount}</div>
					<p className="text-xs text-muted-foreground">{tradeCount} trades executed</p>
				</CardContent>
			</Card>
		</div>
	);
}
