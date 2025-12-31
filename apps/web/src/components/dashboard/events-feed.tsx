'use client';

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@repo/ui/components/context-menu';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import { cn } from '@repo/ui/lib/utils';
import { Copy, Filter, LineChart, Radio } from 'lucide-react';
import { useState } from 'react';
import { useAutoScroll } from '@/hooks/use-auto-scroll';
import type { EventType, TradeEvent } from '@/services/types';

type EventFilter = 'all' | 'trades' | 'quotes' | 'market';

interface EventsFeedProps {
	events: TradeEvent[];
	onShowOnChart?: (event: TradeEvent) => void;
}

const eventTypeLabels: Record<EventType, string> = {
	trade: 'Trade',
	fill: 'Fill',
	quote_update: 'Quote',
	price_move: 'Price Move',
	volume_spike: 'Volume Spike',
	spread_change: 'Spread Change',
};

const eventBadgeColors: Record<EventType, string> = {
	trade: 'bg-green-500',
	fill: 'bg-blue-500',
	quote_update: 'bg-slate-500',
	price_move: 'bg-amber-500',
	volume_spike: 'bg-cyan-500',
	spread_change: 'bg-purple-500',
};

const sideBorderColors: Record<string, string> = {
	yes: 'border-l-green-500',
	no: 'border-l-red-500',
	unknown: 'border-l-muted-foreground',
};

function filterEvents(events: TradeEvent[], filter: EventFilter): TradeEvent[] {
	if (filter === 'all') return events;
	if (filter === 'trades') return events.filter((e) => ['trade', 'fill'].includes(e.eventType));
	if (filter === 'quotes') return events.filter((e) => e.eventType === 'quote_update');
	if (filter === 'market')
		return events.filter((e) => ['price_move', 'volume_spike', 'spread_change'].includes(e.eventType));
	return events;
}

function getEventDescription(event: TradeEvent): string {
	const details = event.details as Record<string, unknown> | undefined;
	switch (event.eventType) {
		case 'trade':
		case 'fill':
			if (details?.price && details?.size) {
				return `${details.size} @ ${(Number(details.price) * 100).toFixed(1)}¢`;
			}
			return event.side === 'yes' ? 'YES' : 'NO';
		case 'quote_update':
			if (details?.bid && details?.ask) {
				return `Bid ${(Number(details.bid) * 100).toFixed(1)}¢ / Ask ${(Number(details.ask) * 100).toFixed(1)}¢`;
			}
			return 'Quote updated';
		case 'price_move':
			if (details?.delta) {
				const delta = Number(details.delta) * 100;
				return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}¢`;
			}
			return 'Price moved';
		case 'volume_spike':
			if (details?.volume) {
				return `${details.volume} contracts`;
			}
			return 'Volume spike';
		case 'spread_change':
			if (details?.spread) {
				return `Spread: ${(Number(details.spread) * 100).toFixed(1)}¢`;
			}
			return 'Spread changed';
		default:
			return event.eventType;
	}
}

function getEventDetail(event: TradeEvent): string | null {
	const details = event.details as Record<string, unknown> | undefined;
	if (!details) return null;
	if (details.detail) return String(details.detail);
	if (event.eventType === 'fill' && details.orderId) return `Order ${String(details.orderId).slice(0, 8)}`;
	return null;
}

export function EventsFeed({ events, onShowOnChart }: EventsFeedProps) {
	const [filter, setFilter] = useState<EventFilter>('all');
	const { scrollRef, isAtBottom, newCount, scrollToBottom, handleScroll } = useAutoScroll(events.length);

	const filteredEvents = filterEvents(events, filter);
	const reversedEvents = [...filteredEvents].reverse();

	const handleCopyDetails = (event: TradeEvent) => {
		const text = `${event.eventType.toUpperCase()} - ${event.side.toUpperCase()} - ${getEventDescription(event)}`;
		navigator.clipboard.writeText(text);
	};

	return (
		<Card className="flex flex-col">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle className="text-base font-medium">Trade Activity</CardTitle>
					<CardDescription>Real-time market events</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					{newCount > 0 && !isAtBottom && (
						<Button variant="ghost" size="sm" className="h-7 text-xs" onClick={scrollToBottom}>
							{newCount} new ↓
						</Button>
					)}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="h-7 gap-1">
								<Filter className="h-3 w-3" />
								<span className="hidden sm:inline">Filter</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuRadioGroup value={filter} onValueChange={(v) => setFilter(v as EventFilter)}>
								<DropdownMenuRadioItem value="all">All Events</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="trades">Trades & Fills</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="quotes">Quote Updates</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="market">Market Events</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent className="flex-1 p-0">
				<ScrollArea className="h-[320px]" ref={scrollRef} onScrollCapture={handleScroll}>
					<div className="space-y-1 p-4 pt-0">
						{reversedEvents.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="mb-4 rounded-full bg-muted p-3">
									<Radio className="h-6 w-6 text-muted-foreground" />
								</div>
								<p className="font-medium">Waiting for events</p>
								<p className="mt-1 text-sm text-muted-foreground">Events will appear when trading begins</p>
							</div>
						) : (
							reversedEvents.map((event) => (
								<ContextMenu key={event.eventId}>
									<ContextMenuTrigger>
										<div
											className={cn(
												'group flex gap-3 rounded-lg border-l-2 p-2 transition-colors hover:bg-muted/50',
												sideBorderColors[event.side] || 'border-l-muted-foreground'
											)}
										>
											<span className="w-16 shrink-0 text-xs font-mono tabular-nums text-muted-foreground">
												{new Date(event.timestamp).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
													second: '2-digit',
												})}
											</span>
											<div className="min-w-0 flex-1">
												<div className="flex items-center gap-2">
													<Badge className={cn('text-white', eventBadgeColors[event.eventType])}>
														{eventTypeLabels[event.eventType]}
													</Badge>
													<span className="text-sm font-medium">{event.side.toUpperCase()}</span>
												</div>
												<p className="mt-0.5 truncate text-sm text-muted-foreground">
													{getEventDescription(event)}
												</p>
												{getEventDetail(event) && (
													<p className="mt-0.5 text-xs text-muted-foreground">{getEventDetail(event)}</p>
												)}
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
												onClick={() => onShowOnChart?.(event)}
											>
												<LineChart className="h-3 w-3" />
											</Button>
										</div>
									</ContextMenuTrigger>
									<ContextMenuContent>
										<ContextMenuItem onClick={() => onShowOnChart?.(event)}>
											<LineChart className="mr-2 h-4 w-4" />
											Show on Chart
										</ContextMenuItem>
										<ContextMenuItem
											onClick={() =>
												setFilter(
													['trade', 'fill'].includes(event.eventType)
														? 'trades'
														: event.eventType === 'quote_update'
															? 'quotes'
															: 'market'
												)
											}
										>
											<Filter className="mr-2 h-4 w-4" />
											Filter to {eventTypeLabels[event.eventType]}
										</ContextMenuItem>
										<ContextMenuSeparator />
										<ContextMenuItem onClick={() => handleCopyDetails(event)}>
											<Copy className="mr-2 h-4 w-4" />
											Copy Details
										</ContextMenuItem>
									</ContextMenuContent>
								</ContextMenu>
							))
						)}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
