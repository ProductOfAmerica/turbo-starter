'use client';

import { useMemo, useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { StatusBar } from '@/components/dashboard/status-bar';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ChartCard } from '@/components/dashboard/chart-card';
import { EventsFeed } from '@/components/dashboard/events-feed';
import { TradesFeed } from '@/components/dashboard/trades-feed';
import { useTradingStream } from '@/hooks/use-trading-stream';
import type { BotStatus } from '@/services/types';

const EDGE_THRESHOLD = 0.05;

export default function DashboardPage() {
	const [commandOpen, setCommandOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [botStatus, setBotStatus] = useState<BotStatus>('IDLE');
	const [dryRun, setDryRun] = useState(true);
	const [elapsed, setElapsed] = useState(0);

	const {
		isConnected,
		posterior,
		marketPrices,
		events,
		trades,
		probabilityHistory,
		connect,
		disconnect,
		reset,
	} = useTradingStream();

	const matchInfo = 'T1 vs G2 · League of Legends';

	const stats = useMemo(() => {
		const yesPrice = marketPrices?.yesPrice ?? null;
		const noPrice = marketPrices?.noPrice ?? null;
		const edge = yesPrice !== null ? posterior - yesPrice : 0;

		const winCount = trades.filter((t) => t.success).length;
		const pnl = trades.reduce((sum, t) => {
			if (!t.success) return sum;
			return sum + (t.side === 'BUY' ? -t.price * t.size : t.price * t.size);
		}, 0);

		const position = trades.reduce((sum, t) => {
			if (!t.success) return sum;
			return sum + (t.side === 'BUY' ? t.size : -t.size);
		}, 0);

		const exposure = Math.abs(position) * (yesPrice ?? 0.5);

		const prevProbability = probabilityHistory.length > 1
			? probabilityHistory[probabilityHistory.length - 2]?.posterior ?? posterior
			: posterior;
		const modelProbabilityDelta = posterior - prevProbability;

		return {
			pnl,
			tradeCount: trades.length,
			winCount,
			modelProbability: posterior,
			modelProbabilityDelta,
			yesPrice,
			noPrice,
			edge,
			edgeThreshold: EDGE_THRESHOLD,
			position,
			exposure,
			eventCount: events.length,
		};
	}, [posterior, marketPrices, trades, events, probabilityHistory]);

	const handleStart = () => {
		setBotStatus('STARTING');
		setTimeout(() => {
			setBotStatus('RUNNING');
			connect('lol', 'demo-match', undefined);
		}, 1500);
	};

	const handlePause = () => {
		setBotStatus('PAUSED');
	};

	const handleResume = () => {
		setBotStatus('RUNNING');
	};

	const handleStop = () => {
		setBotStatus('STOPPING');
		setTimeout(() => {
			setBotStatus('STOPPED');
			disconnect();
			reset();
		}, 1000);
	};

	const handleRetry = () => {
		setBotStatus('STARTING');
		setTimeout(() => setBotStatus('RUNNING'), 1500);
	};

	const handleConfigure = () => {
		setSettingsOpen(true);
	};

	return (
		<div className="min-h-screen bg-background">
			<Header
				matchInfo={matchInfo}
				onCommandOpen={() => setCommandOpen(true)}
				onSettingsOpen={() => setSettingsOpen(true)}
			/>

			<main className="mx-auto max-w-7xl flex-1 space-y-6 overflow-auto p-6">
				<StatusBar
					status={botStatus}
					connection={isConnected ? 'connected' : 'disconnected'}
					elapsed={elapsed}
					dryRun={dryRun}
					onStart={handleStart}
					onPause={handlePause}
					onResume={handleResume}
					onStop={handleStop}
					onRetry={handleRetry}
					onConfigure={handleConfigure}
					onDryRunChange={setDryRun}
				/>

				<StatsCards {...stats} />

				<ChartCard
					history={probabilityHistory}
					marketPriceHistory={
						marketPrices
							? [{ timestamp: marketPrices.timestamp, price: marketPrices.yesPrice }]
							: []
					}
					events={events}
				/>

				<div className="grid gap-6 lg:grid-cols-2">
					<EventsFeed events={events} />
					<TradesFeed trades={trades} edgeThreshold={EDGE_THRESHOLD} />
				</div>
			</main>
		</div>
	);
}
