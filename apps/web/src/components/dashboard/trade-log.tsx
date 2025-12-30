'use client';

import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui/components/table';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatPrice } from '@/services/trade-evaluator';
import type { TradeExecution } from '@/services/types';

interface TradeLogProps {
	trades: TradeExecution[];
}

export function TradeLog({ trades }: TradeLogProps) {
	const reversedTrades = [...trades].reverse();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Trade Log</CardTitle>
				<CardDescription>Order execution history</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[300px]">
					{reversedTrades.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">No trades executed yet</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Time</TableHead>
									<TableHead>Side</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Size</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{reversedTrades.map((trade) => (
									<TableRow key={trade.id}>
										<TableCell className="text-xs">
											{new Date(trade.timestamp).toLocaleTimeString()}
										</TableCell>
										<TableCell>
											<Badge
												variant={trade.side === 'BUY' ? 'default' : 'secondary'}
												className={trade.side === 'BUY' ? 'bg-green-500' : 'bg-red-500'}
											>
												{trade.side}
											</Badge>
										</TableCell>
										<TableCell>{formatPrice(trade.price)}</TableCell>
										<TableCell>{trade.size}</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												{trade.success ? (
													<CheckCircle className="h-4 w-4 text-green-500" />
												) : (
													<XCircle className="h-4 w-4 text-red-500" />
												)}
												{trade.simulated && (
													<Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">
														SIMULATED
													</Badge>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
