'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@repo/ui/components/context-menu';
import { Copy, Filter, LineChart, Radio } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';
import type { GameEvent, EventType } from '@/services/types';

type EventFilter = 'all' | 'kills' | 'objectives' | 'structures';

interface EventsFeedProps {
	events: GameEvent[];
	onShowOnChart?: (event: GameEvent) => void;
}

const eventTypeLabels: Record<EventType, string> = {
	kill: 'Kill',
	dragon: 'Dragon',
	baron: 'Baron',
	tower: 'Tower',
	inhibitor: 'Inhibitor',
	roshan: 'Roshan',
};

const eventBadgeColors: Record<EventType, string> = {
	kill: 'bg-red-500',
	dragon: 'bg-orange-500',
	baron: 'bg-purple-500',
	tower: 'bg-blue-500',
	inhibitor: 'bg-pink-500',
	roshan: 'bg-yellow-500',
};

const teamBorderColors: Record<string, string> = {
	blue: 'border-l-blue-500',
	radiant: 'border-l-blue-500',
	team1: 'border-l-blue-500',
	red: 'border-l-red-500',
	dire: 'border-l-red-500',
	team2: 'border-l-red-500',
	unknown: 'border-l-muted-foreground',
};

function filterEvents(events: GameEvent[], filter: EventFilter): GameEvent[] {
	if (filter === 'all') return events;
	if (filter === 'kills') return events.filter((e) => e.eventType === 'kill');
	if (filter === 'objectives') return events.filter((e) => ['dragon', 'baron', 'roshan'].includes(e.eventType));
	if (filter === 'structures') return events.filter((e) => ['tower', 'inhibitor'].includes(e.eventType));
	return events;
}

function getEventDescription(event: GameEvent): string {
	const details = event.details as Record<string, unknown> | undefined;
	switch (event.eventType) {
		case 'kill':
			return details?.killer && details?.victim
				? `${details.killer} → ${details.victim}`
				: 'Kill secured';
		case 'dragon':
			return details?.dragonType ? `${details.dragonType} Drake` : 'Dragon';
		case 'baron':
			return 'Baron Nashor';
		case 'tower':
			return details?.lane && details?.tier
				? `${details.lane} ${details.tier} Tower`
				: 'Tower destroyed';
		case 'inhibitor':
			return details?.lane ? `${details.lane} Inhibitor` : 'Inhibitor destroyed';
		case 'roshan':
			return 'Roshan';
		default:
			return event.eventType;
	}
}

function getEventDetail(event: GameEvent): string | null {
	const details = event.details as Record<string, unknown> | undefined;
	if (!details) return null;
	if (details.detail) return String(details.detail);
	if (event.eventType === 'kill' && details.isFirstBlood) return 'First Blood';
	return null;
}

export function EventsFeed({ events, onShowOnChart }: EventsFeedProps) {
	const [filter, setFilter] = useState<EventFilter>('all');
	const [isAtBottom, setIsAtBottom] = useState(true);
	const [newCount, setNewCount] = useState(0);
	const scrollRef = useRef<HTMLDivElement>(null);
	const prevEventsLengthRef = useRef(events.length);

	const filteredEvents = filterEvents(events, filter);
	const reversedEvents = [...filteredEvents].reverse();

	const scrollToBottom = useCallback(() => {
		if (scrollRef.current) {
			const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
				setNewCount(0);
				setIsAtBottom(true);
			}
		}
	}, []);

	useEffect(() => {
		if (events.length > prevEventsLengthRef.current) {
			const newEventsCount = events.length - prevEventsLengthRef.current;
			if (isAtBottom) {
				setTimeout(scrollToBottom, 0);
			} else {
				setNewCount((prev) => prev + newEventsCount);
			}
		}
		prevEventsLengthRef.current = events.length;
	}, [events.length, isAtBottom, scrollToBottom]);

	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		const target = e.target as HTMLDivElement;
		const isBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 10;
		setIsAtBottom(isBottom);
		if (isBottom) {
			setNewCount(0);
		}
	}, []);

	const handleCopyDetails = (event: GameEvent) => {
		const text = `${event.eventType.toUpperCase()} - ${event.team} - ${getEventDescription(event)}`;
		navigator.clipboard.writeText(text);
	};

	return (
		<Card className="flex flex-col">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle className="text-base font-medium">Game Events</CardTitle>
					<CardDescription>Real-time match feed</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					{newCount > 0 && !isAtBottom && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs"
							onClick={scrollToBottom}
						>
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
								<DropdownMenuRadioItem value="kills">Kills</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="objectives">Objectives</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="structures">Structures</DropdownMenuRadioItem>
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
								<p className="mt-1 text-sm text-muted-foreground">
									Events will appear when the match goes live
								</p>
							</div>
						) : (
							reversedEvents.map((event) => (
								<ContextMenu key={event.eventId}>
									<ContextMenuTrigger>
										<div
											className={cn(
												'group flex gap-3 rounded-lg border-l-2 p-2 transition-colors hover:bg-muted/50',
												teamBorderColors[event.team] || 'border-l-muted-foreground'
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
														{eventTypeLabels[event.eventType] || event.eventType.toUpperCase()}
													</Badge>
													<span className="text-sm font-medium">
														{event.team.charAt(0).toUpperCase() + event.team.slice(1)}
													</span>
												</div>
												<p className="mt-0.5 truncate text-sm text-muted-foreground">
													{getEventDescription(event)}
												</p>
												{getEventDetail(event) && (
													<p className="mt-0.5 text-xs text-muted-foreground">
														{getEventDetail(event)}
													</p>
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
										<ContextMenuItem onClick={() => setFilter(
											event.eventType === 'kill' ? 'kills' :
											['dragon', 'baron', 'roshan'].includes(event.eventType) ? 'objectives' :
											['tower', 'inhibitor'].includes(event.eventType) ? 'structures' : 'all'
										)}>
											<Filter className="mr-2 h-4 w-4" />
											Filter to {eventTypeLabels[event.eventType] || event.eventType}
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
