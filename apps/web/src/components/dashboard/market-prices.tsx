'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Progress } from '@repo/ui/components/progress';
import { formatPrice } from '@/services/trade-evaluator';

interface MarketPricesProps {
	yesPrice: number | null;
	noPrice: number | null;
	lastUpdate: Date | null;
}

export function MarketPrices({ yesPrice, noPrice, lastUpdate }: MarketPricesProps) {
	const yesPercent = yesPrice !== null ? yesPrice * 100 : 50;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Market Prices</CardTitle>
				<CardDescription>
					{lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Waiting for data...'}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span className="text-green-500 font-medium">YES</span>
						<span className="text-red-500 font-medium">NO</span>
					</div>
					<Progress value={yesPercent} className="h-3" />
					<div className="flex justify-between text-lg font-bold">
						<span className="text-green-500">{yesPrice !== null ? formatPrice(yesPrice) : '--'}</span>
						<span className="text-red-500">{noPrice !== null ? formatPrice(noPrice) : '--'}</span>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4 pt-4 border-t">
					<div className="text-center">
						<p className="text-xs text-muted-foreground">Implied Prob (YES)</p>
						<p className="text-lg font-semibold">
							{yesPrice !== null ? `${(yesPrice * 100).toFixed(1)}%` : '--'}
						</p>
					</div>
					<div className="text-center">
						<p className="text-xs text-muted-foreground">Implied Prob (NO)</p>
						<p className="text-lg font-semibold">{noPrice !== null ? `${(noPrice * 100).toFixed(1)}%` : '--'}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
