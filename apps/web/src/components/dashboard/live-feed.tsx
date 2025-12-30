'use client';

import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { ScrollArea } from '@repo/ui/components/scroll-area';
import type { GameEvent } from '@/services/types';

interface LiveFeedProps {
	events: GameEvent[];
}

const eventColors: Record<string, string> = {
	kill: 'bg-red-500',
	dragon: 'bg-orange-500',
	baron: 'bg-purple-500',
	tower: 'bg-blue-500',
	inhibitor: 'bg-pink-500',
	roshan: 'bg-yellow-500',
};

const teamColors: Record<string, string> = {
	blue: 'text-blue-400',
	radiant: 'text-green-400',
	team1: 'text-blue-400',
	red: 'text-red-400',
	dire: 'text-red-400',
	team2: 'text-red-400',
	unknown: 'text-gray-400',
};

export function LiveFeed({ events }: LiveFeedProps) {
	const reversedEvents = [...events].reverse();

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Live Events</CardTitle>
				<CardDescription>Real-time game events feed</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[300px] pr-4">
					{reversedEvents.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">Waiting for events...</p>
					) : (
						<div className="space-y-3">
							{reversedEvents.map((event) => (
								<div key={event.eventId} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
									<Badge className={`${eventColors[event.eventType]} text-white`}>
										{event.eventType.toUpperCase()}
									</Badge>
									<span className={`font-medium ${teamColors[event.team]}`}>{event.team.toUpperCase()}</span>
									<span className="text-xs text-muted-foreground ml-auto">
										{new Date(event.timestamp).toLocaleTimeString()}
									</span>
								</div>
							))}
						</div>
					)}
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
