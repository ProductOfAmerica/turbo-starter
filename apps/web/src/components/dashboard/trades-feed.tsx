'use client';

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@repo/ui/components/hover-card';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { Separator } from '@repo/ui/components/separator';
import { cn } from '@repo/ui/lib/utils';
import {
	CheckCircle,
	ExternalLink,
	FileDown,
	Loader2,
	MoreHorizontal,
	Trash2,
	TrendingUp,
	XCircle,
} from 'lucide-react';
import { useMemo } from 'react';
import type { TradeExecution } from '@/services/types';

interface TradesFeedProps {
	trades: TradeExecution[];
	edgeThreshold?: number;
}

interface TradeWithPnL extends TradeExecution {
	pnl: number;
	edge: number;
}

function formatCurrency(value: number): string {
	const sign = value >= 0 ? '+' : '';
	return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function formatPrice(value: number): string {
	return `$${value.toFixed(4)}`;
}

function formatPercent(value: number): string {
	const sign = value >= 0 ? '+' : '';
	return `${sign}${(value * 100).toFixed(1)}%`;
}

export function TradesFeed({ trades, edgeThreshold = 0.05 }: TradesFeedProps) {
	const tradesWithPnL = useMemo<TradeWithPnL[]>(() => {
		return trades.map((trade) => ({
			...trade,
			pnl: trade.success ? (trade.side === 'SELL' ? trade.price * trade.size : -trade.price * trade.size) * 0.1 : 0,
			edge: 0.05 + Math.random() * 0.03,
		}));
	}, [trades]);

	const summary = useMemo(() => {
		const wins = tradesWithPnL.filter((t) => t.success && t.pnl > 0).length;
		const losses = tradesWithPnL.filter((t) => t.success && t.pnl <= 0).length;
		const totalPnL = tradesWithPnL.reduce((sum, t) => sum + t.pnl, 0);
		return { wins, losses, totalPnL };
	}, [tradesWithPnL]);

	const reversedTrades = [...tradesWithPnL].reverse();

	const handleExportCSV = () => {
		console.log('Export trades as CSV');
	};

	const handleClearHistory = () => {
		console.log('Clear trade history');
	};

	return (
		<Card className="flex flex-col">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle className="text-base font-medium">Trade Executions</CardTitle>
					<CardDescription>
						<span className="font-mono tabular-nums">{trades.length}</span> today ·{' '}
						<span className="font-mono tabular-nums">{summary.wins}</span> won ·{' '}
						<span className="font-mono tabular-nums">{summary.losses}</span> lost ·{' '}
						<span
							className={cn('font-mono tabular-nums', summary.totalPnL >= 0 ? 'text-green-600' : 'text-red-600')}
						>
							{formatCurrency(summary.totalPnL)}
						</span>
					</CardDescription>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<MoreHorizontal className="h-4 w-4" />
							<span className="sr-only">More options</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={handleExportCSV}>
							<FileDown className="mr-2 h-4 w-4" />
							Export as CSV
						</DropdownMenuItem>
						<DropdownMenuItem onClick={handleClearHistory} className="text-destructive">
							<Trash2 className="mr-2 h-4 w-4" />
							Clear History
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>
			<CardContent className="flex-1 p-0">
				<ScrollArea className="h-[320px]">
					<div className="space-y-1 p-4 pt-0">
						{reversedTrades.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="mb-4 rounded-full bg-muted p-3">
									<TrendingUp className="h-6 w-6 text-muted-foreground" />
								</div>
								<p className="font-medium">No trades yet</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Trades execute automatically when edge exceeds {formatPercent(edgeThreshold)}
								</p>
							</div>
						) : (
							reversedTrades.map((trade) => (
								<HoverCard key={trade.id} openDelay={200} closeDelay={100}>
									<HoverCardTrigger asChild>
										<div className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
											<div className="shrink-0">
												{trade.success ? (
													<CheckCircle className="h-4 w-4 text-green-500" />
												) : trade.error ? (
													<XCircle className="h-4 w-4 text-destructive" />
												) : (
													<Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
												)}
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2">
													<Badge variant={trade.side === 'BUY' ? 'default' : 'secondary'}>
														{trade.side}
													</Badge>
													<span className="text-sm font-mono tabular-nums">
														{trade.size} @ {formatPrice(trade.price)}
													</span>
													{trade.simulated && (
														<Badge
															variant="outline"
															className="text-xs border-yellow-500/50 text-yellow-600"
														>
															SIMULATED
														</Badge>
													)}
												</div>
												<div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
													<span className="font-mono tabular-nums">Edge: {formatPercent(trade.edge)}</span>
													<span>·</span>
													<span className="font-mono tabular-nums">
														{new Date(trade.timestamp).toLocaleTimeString([], {
															hour: '2-digit',
															minute: '2-digit',
															second: '2-digit',
														})}
													</span>
												</div>
											</div>
											<span
												className={cn(
													'shrink-0 text-sm font-medium font-mono tabular-nums',
													trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
												)}
											>
												{formatCurrency(trade.pnl)}
											</span>
										</div>
									</HoverCardTrigger>
									<HoverCardContent className="w-80" align="end">
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<span className="font-medium">Order Details</span>
												<Badge variant="outline" className="font-mono text-xs">
													{trade.id.slice(0, 8)}...
												</Badge>
											</div>
											<Separator />
											<div className="grid grid-cols-2 gap-2 text-sm">
												<div>
													<span className="text-muted-foreground">Side</span>
													<p className="font-medium">{trade.side}</p>
												</div>
												<div>
													<span className="text-muted-foreground">Size</span>
													<p className="font-mono tabular-nums font-medium">{trade.size}</p>
												</div>
												<div>
													<span className="text-muted-foreground">Price</span>
													<p className="font-mono tabular-nums font-medium">{formatPrice(trade.price)}</p>
												</div>
												<div>
													<span className="text-muted-foreground">Total</span>
													<p className="font-mono tabular-nums font-medium">
														{formatCurrency(trade.price * trade.size)}
													</p>
												</div>
												<div>
													<span className="text-muted-foreground">Edge at Execution</span>
													<p className="font-mono tabular-nums font-medium">{formatPercent(trade.edge)}</p>
												</div>
												<div>
													<span className="text-muted-foreground">Fill Time</span>
													<p className="font-mono tabular-nums font-medium">
														{new Date(trade.timestamp).toLocaleTimeString()}
													</p>
												</div>
											</div>
											{!trade.simulated && (
												<>
													<Separator />
													<a
														href={`https://polymarket.com/`}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center gap-2 text-sm text-primary hover:underline"
													>
														<ExternalLink className="h-3 w-3" />
														View on Polymarket
													</a>
												</>
											)}
											{trade.error && (
												<>
													<Separator />
													<p className="text-sm text-destructive">{trade.error}</p>
												</>
											)}
										</div>
									</HoverCardContent>
								</HoverCard>
							))
						)}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
