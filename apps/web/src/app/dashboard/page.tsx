'use client';

import { useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { StatusBar } from '@/components/dashboard/status-bar';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ProbabilityChart } from '@/components/dashboard/probability-chart';
import { LiveFeed } from '@/components/dashboard/live-feed';
import { TradeLog } from '@/components/dashboard/trade-log';
import { useTradingStream } from '@/hooks/use-trading-stream';
import type { BotStatus } from '@/services/types';

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

				<StatsCards
					posterior={posterior}
					yesPrice={marketPrices?.yesPrice ?? null}
					noPrice={marketPrices?.noPrice ?? null}
					eventCount={events.length}
					tradeCount={trades.length}
				/>

				<ProbabilityChart
					history={probabilityHistory}
					marketPrice={marketPrices?.yesPrice}
				/>

				<div className="grid gap-6 lg:grid-cols-2">
					<LiveFeed events={events} />
					<TradeLog trades={trades} />
				</div>
			</main>
		</div>
	);
}
