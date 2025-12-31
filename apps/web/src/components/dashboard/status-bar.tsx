'use client';

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { cn } from '@repo/ui/lib/utils';
import { Activity, Loader2, Pause, Play, RotateCcw, Settings, Square } from 'lucide-react';
import type { BotStatus, ConnectionStatus } from '@/services/types';

interface StatusBarProps {
	status: BotStatus;
	connection: ConnectionStatus;
	elapsed: number;
	tickerCount: number;
	canStart: boolean;
	missingMatchId: boolean;
	onStart: () => void;
	onPause: () => void;
	onResume: () => void;
	onStop: () => void;
	onRetry: () => void;
	onConfigure: () => void;
}

function formatElapsed(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;
	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
	return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

const statusConfig: Record<BotStatus, { badge: string; dot: string; text: (elapsed: number) => string }> = {
	IDLE: {
		badge: 'border-muted-foreground/50',
		dot: 'bg-muted-foreground',
		text: () => 'IDLE',
	},
	STARTING: {
		badge: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600',
		dot: 'bg-yellow-500 animate-pulse',
		text: () => 'STARTING...',
	},
	RUNNING: {
		badge: 'border-green-500/50 bg-green-500/10 text-green-600',
		dot: 'bg-green-500 animate-pulse',
		text: (elapsed) => `LIVE · ${formatElapsed(elapsed)}`,
	},
	PAUSED: {
		badge: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600',
		dot: 'bg-yellow-500',
		text: (elapsed) => `PAUSED · ${formatElapsed(elapsed)}`,
	},
	STOPPING: {
		badge: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600',
		dot: 'bg-yellow-500 animate-pulse',
		text: () => 'STOPPING...',
	},
	STOPPED: {
		badge: 'border-muted-foreground/50',
		dot: 'bg-muted-foreground',
		text: () => 'STOPPED',
	},
	ERROR: {
		badge: 'border-destructive/50 bg-destructive/10 text-destructive',
		dot: 'bg-destructive',
		text: () => 'ERROR',
	},
};

export function StatusBar({
	status,
	connection,
	elapsed,
	tickerCount,
	canStart,
	missingMatchId,
	onStart,
	onPause,
	onResume,
	onStop,
	onRetry,
	onConfigure,
}: StatusBarProps) {
	const config = statusConfig[status];

	return (
		<Card className="flex items-center justify-between p-4">
			<div className="flex items-center gap-4">
				<Badge variant="outline" className={cn('gap-1.5', config.badge)}>
					<span className={cn('h-2 w-2 rounded-full', config.dot)} />
					{config.text(elapsed)}
				</Badge>

				<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
					<span
						className={cn(
							'h-1.5 w-1.5 rounded-full',
							connection === 'connected' && 'bg-green-500',
							connection === 'reconnecting' && 'bg-yellow-500 animate-pulse',
							connection === 'disconnected' && 'bg-destructive'
						)}
					/>
					{connection === 'connected' && 'Connected'}
					{connection === 'reconnecting' && 'Reconnecting...'}
					{connection === 'disconnected' && 'Disconnected'}
				</div>

				{tickerCount > 0 && (
					<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
						<Activity className="h-3 w-3" />
						<span className="font-mono tabular-nums">{tickerCount.toLocaleString()}</span>
					</div>
				)}
			</div>

			<div className="flex items-center gap-2">
				{status === 'IDLE' && (
					<>
						{missingMatchId && <span className="text-sm text-muted-foreground">Enter Match ID to start</span>}
						<Button onClick={onStart} disabled={!canStart}>
							<Play className="mr-2 h-4 w-4" />
							Start Bot
						</Button>
						{missingMatchId && (
							<Button variant="secondary" onClick={onConfigure}>
								<Settings className="mr-2 h-4 w-4" />
								Configure
							</Button>
						)}
					</>
				)}

				{status === 'STARTING' && (
					<Button disabled>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Starting...
					</Button>
				)}

				{status === 'RUNNING' && (
					<>
						<Button variant="secondary" onClick={onPause}>
							<Pause className="mr-2 h-4 w-4" />
							Pause
						</Button>
						<Button variant="destructive" onClick={onStop}>
							<Square className="mr-2 h-4 w-4" />
							Stop
						</Button>
					</>
				)}

				{status === 'PAUSED' && (
					<>
						<Button onClick={onResume}>
							<Play className="mr-2 h-4 w-4" />
							Resume
						</Button>
						<Button variant="destructive" onClick={onStop}>
							<Square className="mr-2 h-4 w-4" />
							Stop
						</Button>
					</>
				)}

				{status === 'STOPPING' && (
					<Button disabled>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Stopping...
					</Button>
				)}

				{status === 'STOPPED' && (
					<>
						{missingMatchId && <span className="text-sm text-muted-foreground">Enter Match ID to start</span>}
						<Button onClick={onStart} disabled={!canStart}>
							<Play className="mr-2 h-4 w-4" />
							Start Bot
						</Button>
						{missingMatchId && (
							<Button variant="secondary" onClick={onConfigure}>
								<Settings className="mr-2 h-4 w-4" />
								Configure
							</Button>
						)}
					</>
				)}

				{status === 'ERROR' && (
					<>
						<Button onClick={onRetry}>
							<RotateCcw className="mr-2 h-4 w-4" />
							Retry
						</Button>
						<Button variant="secondary" onClick={onConfigure}>
							<Settings className="mr-2 h-4 w-4" />
							Configure
						</Button>
					</>
				)}
			</div>
		</Card>
	);
}
