'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuCheckboxItem,
	DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuCheckboxItem,
	ContextMenuTrigger,
} from '@repo/ui/components/context-menu';
import { ChartContainer } from '@repo/ui/components/chart';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	ReferenceLine,
	ReferenceDot,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';
import { Download, Eye, FileDown, Loader2, Maximize2, MoreHorizontal } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import type { GameEvent, ProbabilityUpdate } from '@/services/types';

type TimeRange = '1m' | '5m' | '15m' | 'all';

interface ChartCardProps {
	history: ProbabilityUpdate[];
	marketPriceHistory: Array<{ timestamp: Date; price: number }>;
	events: GameEvent[];
	isLoading?: boolean;
}

interface ChartDataPoint {
	timestamp: number;
	time: string;
	model: number;
	market: number | null;
	edge: number | null;
}

function formatTime(date: Date): string {
	return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }> }) {
	if (!active || !payload?.length) return null;

	const data = payload[0]?.payload;
	if (!data) return null;

	const edge = data.market !== null ? data.model - data.market : null;

	return (
		<div className="rounded-lg border bg-background px-3 py-2 shadow-md">
			<p className="text-xs text-muted-foreground">{data.time}</p>
			<div className="mt-1 space-y-1">
				<div className="flex items-center justify-between gap-4 text-sm">
					<span className="text-muted-foreground">Model:</span>
					<span className="font-mono tabular-nums font-medium">{data.model.toFixed(1)}%</span>
				</div>
				{data.market !== null && (
					<div className="flex items-center justify-between gap-4 text-sm">
						<span className="text-muted-foreground">Market:</span>
						<span className="font-mono tabular-nums font-medium">{data.market.toFixed(1)}%</span>
					</div>
				)}
				{edge !== null && (
					<div className="flex items-center justify-between gap-4 text-sm">
						<span className="text-muted-foreground">Edge:</span>
						<span className={cn('font-mono tabular-nums font-medium', edge > 0 ? 'text-green-600' : edge < 0 ? 'text-red-600' : '')}>
							{edge > 0 ? '+' : ''}{edge.toFixed(1)}%
						</span>
					</div>
				)}
			</div>
		</div>
	);
}

export function ChartCard({ history, marketPriceHistory, events, isLoading = false }: ChartCardProps) {
	const [timeRange, setTimeRange] = useState<TimeRange>('all');
	const [showModelLine, setShowModelLine] = useState(true);
	const [showMarketLine, setShowMarketLine] = useState(true);
	const [showEventMarkers, setShowEventMarkers] = useState(true);

	const chartData = useMemo<ChartDataPoint[]>(() => {
		const now = Date.now();
		const rangeMs: Record<TimeRange, number> = {
			'1m': 60 * 1000,
			'5m': 5 * 60 * 1000,
			'15m': 15 * 60 * 1000,
			'all': Infinity,
		};
		const cutoff = timeRange === 'all' ? 0 : now - rangeMs[timeRange];

		return history
			.filter((h) => new Date(h.timestamp).getTime() >= cutoff)
			.map((h) => {
				const ts = new Date(h.timestamp).getTime();
				const marketPoint = marketPriceHistory.find(
					(m) => Math.abs(new Date(m.timestamp).getTime() - ts) < 5000
				);
				const market = marketPoint ? marketPoint.price * 100 : null;
				return {
					timestamp: ts,
					time: formatTime(new Date(h.timestamp)),
					model: h.posterior * 100,
					market,
					edge: market !== null ? (h.posterior * 100) - market : null,
				};
			});
	}, [history, marketPriceHistory, timeRange]);

	const eventMarkers = useMemo(() => {
		if (!showEventMarkers || history.length === 0) return [];
		const now = Date.now();
		const rangeMs: Record<TimeRange, number> = {
			'1m': 60 * 1000,
			'5m': 5 * 60 * 1000,
			'15m': 15 * 60 * 1000,
			'all': Infinity,
		};
		const cutoff = timeRange === 'all' ? 0 : now - rangeMs[timeRange];

		return events
			.filter((e) => new Date(e.timestamp).getTime() >= cutoff)
			.map((e) => {
				const ts = new Date(e.timestamp).getTime();
				const nearestPoint = history.reduce<ProbabilityUpdate | undefined>((closest, h) => {
					if (!closest) return h;
					const hTs = new Date(h.timestamp).getTime();
					const closestTs = new Date(closest.timestamp).getTime();
					return Math.abs(hTs - ts) < Math.abs(closestTs - ts) ? h : closest;
				}, undefined);
				return {
					timestamp: ts,
					y: nearestPoint ? nearestPoint.posterior * 100 : 50,
					team: e.team,
					type: e.eventType,
				};
			});
	}, [events, history, timeRange, showEventMarkers]);

	const handleExportPNG = () => {
		console.log('Export as PNG');
	};

	const handleExportCSV = () => {
		console.log('Export as CSV');
	};

	const handleResetZoom = () => {
		setTimeRange('all');
	};

	const timeRanges: TimeRange[] = ['1m', '5m', '15m', 'all'];

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle className="text-base font-medium">Win Probability Over Time</CardTitle>
					<CardDescription>Model prediction vs market price</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<div className="inline-flex items-center rounded-md border bg-muted p-1">
						{timeRanges.map((range) => (
							<Button
								key={range}
								variant="ghost"
								size="sm"
								className={cn(
									'h-7 px-2.5 text-xs',
									timeRange === range && 'bg-background shadow-sm'
								)}
								onClick={() => setTimeRange(range)}
							>
								{range === 'all' ? 'All' : range.toUpperCase()}
							</Button>
						))}
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<MoreHorizontal className="h-4 w-4" />
								<span className="sr-only">More options</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuCheckboxItem
								checked={showModelLine}
								onCheckedChange={setShowModelLine}
							>
								<Eye className="mr-2 h-4 w-4" />
								Toggle Model Line
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={showMarketLine}
								onCheckedChange={setShowMarketLine}
							>
								<Eye className="mr-2 h-4 w-4" />
								Toggle Market Line
							</DropdownMenuCheckboxItem>
							<DropdownMenuCheckboxItem
								checked={showEventMarkers}
								onCheckedChange={setShowEventMarkers}
							>
								<Eye className="mr-2 h-4 w-4" />
								Toggle Event Markers
							</DropdownMenuCheckboxItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleExportPNG}>
								<Download className="mr-2 h-4 w-4" />
								Export as PNG
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleExportCSV}>
								<FileDown className="mr-2 h-4 w-4" />
								Export Data as CSV
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground">
						<Loader2 className="h-8 w-8 animate-spin" />
						<span className="text-sm">Loading chart data...</span>
					</div>
				) : (
				<ContextMenu>
					<ContextMenuTrigger>
						<ChartContainer config={{}} className="h-[300px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
									<ReferenceLine
										y={50}
										stroke="hsl(var(--muted-foreground))"
										strokeDasharray="3 3"
										strokeOpacity={0.3}
									/>
									<XAxis
										dataKey="time"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										interval="preserveStartEnd"
										tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
									/>
									<YAxis
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										domain={[0, 100]}
										tickFormatter={(value: number) => `${value}%`}
										tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
									/>
									<Tooltip content={<CustomTooltip />} />
									{showModelLine && (
										<Line
											type="monotone"
											dataKey="model"
											stroke="hsl(var(--primary))"
											strokeWidth={2}
											dot={false}
											activeDot={{ r: 4 }}
										/>
									)}
									{showMarketLine && (
										<Line
											type="monotone"
											dataKey="market"
											stroke="hsl(var(--muted-foreground))"
											strokeWidth={2}
											strokeDasharray="4 4"
											dot={false}
											connectNulls
										/>
									)}
									{eventMarkers.map((marker, i) => (
										<ReferenceDot
											key={`${marker.timestamp}-${i}`}
											x={formatTime(new Date(marker.timestamp))}
											y={marker.y}
											r={4}
											fill={marker.team === 'blue' || marker.team === 'radiant' ? '#3b82f6' : '#ef4444'}
											stroke="white"
											strokeWidth={2}
										/>
									))}
								</LineChart>
							</ResponsiveContainer>
						</ChartContainer>
					</ContextMenuTrigger>
					<ContextMenuContent>
						<ContextMenuItem onClick={handleResetZoom}>
							<Maximize2 className="mr-2 h-4 w-4" />
							Reset Zoom
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuCheckboxItem
							checked={showModelLine}
							onCheckedChange={setShowModelLine}
						>
							Show Model Line
						</ContextMenuCheckboxItem>
						<ContextMenuCheckboxItem
							checked={showMarketLine}
							onCheckedChange={setShowMarketLine}
						>
							Show Market Line
						</ContextMenuCheckboxItem>
						<ContextMenuCheckboxItem
							checked={showEventMarkers}
							onCheckedChange={setShowEventMarkers}
						>
							Show Event Markers
						</ContextMenuCheckboxItem>
						<ContextMenuSeparator />
						<ContextMenuItem onClick={handleExportPNG}>
							<Download className="mr-2 h-4 w-4" />
							Export as PNG
						</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>
				)}

				{!isLoading && (
				<div className="mt-4 flex items-center justify-center gap-6 text-sm">
					<div className="flex items-center gap-2">
						<div className="h-0.5 w-4 bg-primary" />
						<span className="text-muted-foreground">Model</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-0.5 w-4 border-t-2 border-dashed border-muted-foreground" />
						<span className="text-muted-foreground">Market</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-blue-500" />
						<span className="text-muted-foreground">Blue Event</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-red-500" />
						<span className="text-muted-foreground">Red Event</span>
					</div>
				</div>
				)}
			</CardContent>
		</Card>
	);
}
