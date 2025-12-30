'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/dashboard/header';
import { StatusBar } from '@/components/dashboard/status-bar';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ChartCard } from '@/components/dashboard/chart-card';
import { EventsFeed } from '@/components/dashboard/events-feed';
import { TradesFeed } from '@/components/dashboard/trades-feed';
import { ConfigSheet } from '@/components/dashboard/config-sheet';
import { CommandPalette } from '@/components/dashboard/command-palette';
import { StopDialog } from '@/components/dashboard/stop-dialog';
import { useTradingStream } from '@/hooks/use-trading-stream';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import type { BotStatus, Config } from '@/services/types';

const DEFAULT_CONFIG: Config = {
	game: 'lol',
	matchId: '',
	marketId: undefined,
	edgeThreshold: 5,
	orderSize: 10,
	maxPosition: 100,
	pollingInterval: 2000,
};

export default function DashboardPage() {
	const [commandOpen, setCommandOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [stopDialogOpen, setStopDialogOpen] = useState(false);
	const [botStatus, setBotStatus] = useState<BotStatus>('IDLE');
	const [dryRun, setDryRun] = useState(true);
	const [elapsed, setElapsed] = useState(0);
	const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);

	const chartRef = useRef<HTMLDivElement>(null);
	const eventsRef = useRef<HTMLDivElement>(null);
	const tradesRef = useRef<HTMLDivElement>(null);

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

	const matchInfo = config.matchId
		? `Match ${config.matchId} · ${config.game === 'lol' ? 'League of Legends' : 'Dota 2'}`
		: 'T1 vs G2 · League of Legends';

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

		const prevProbability =
			probabilityHistory.length > 1
				? (probabilityHistory[probabilityHistory.length - 2]?.posterior ?? posterior)
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
			edgeThreshold: config.edgeThreshold / 100,
			position,
			exposure,
			eventCount: events.length,
		};
	}, [posterior, marketPrices, trades, events, probabilityHistory, config.edgeThreshold]);

	const positionDirection = useMemo(() => {
		if (stats.position > 0) return 'LONG' as const;
		if (stats.position < 0) return 'SHORT' as const;
		return 'FLAT' as const;
	}, [stats.position]);

	const handleStart = useCallback(() => {
		setBotStatus('STARTING');
		setTimeout(() => {
			setBotStatus('RUNNING');
			connect(config.game, config.matchId || 'demo-match', config.marketId);
		}, 1500);
	}, [connect, config]);

	const handlePause = useCallback(() => {
		setBotStatus('PAUSED');
	}, []);

	const handleResume = useCallback(() => {
		setBotStatus('RUNNING');
	}, []);

	const handleStopRequest = useCallback(() => {
		setStopDialogOpen(true);
	}, []);

	const handleStopConfirm = useCallback(() => {
		setBotStatus('STOPPING');
		setTimeout(() => {
			setBotStatus('STOPPED');
			disconnect();
			reset();
		}, 1000);
	}, [disconnect, reset]);

	const handleRetry = useCallback(() => {
		setBotStatus('STARTING');
		setTimeout(() => setBotStatus('RUNNING'), 1500);
	}, []);

	const handleConfigure = useCallback(() => {
		setSettingsOpen(true);
	}, []);

	const handleToggleDryRun = useCallback(() => {
		setDryRun((prev) => !prev);
	}, []);

	const handleSaveConfig = useCallback((newConfig: Config) => {
		setConfig(newConfig);
	}, []);

	const handleExportTrades = useCallback(() => {
		const csv = [
			'Time,Side,Price,Size,Status',
			...trades.map(
				(t) =>
					`${new Date(t.timestamp).toISOString()},${t.side},${t.price},${t.size},${t.success ? 'SUCCESS' : 'FAILED'}`
			),
		].join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `trades-${new Date().toISOString()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}, [trades]);

	const handleExportChart = useCallback(() => {
		// Chart export would require access to the Recharts ref
		console.log('Export chart');
	}, []);

	const handleFocusChart = useCallback(() => {
		chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}, []);

	const handleFocusEvents = useCallback(() => {
		eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}, []);

	const handleFocusTrades = useCallback(() => {
		tradesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}, []);

	const handleShowShortcuts = useCallback(() => {
		setCommandOpen(true);
	}, []);

	const canStart = botStatus === 'IDLE' || botStatus === 'STOPPED';
	const canTogglePlayPause = botStatus === 'RUNNING' || botStatus === 'PAUSED';

	const handleTogglePlayPause = useCallback(() => {
		if (botStatus === 'RUNNING') {
			handlePause();
		} else if (botStatus === 'PAUSED') {
			handleResume();
		}
	}, [botStatus, handlePause, handleResume]);

	useKeyboardShortcuts({
		onCommandPalette: () => setCommandOpen(true),
		onOpenConfig: () => setSettingsOpen(true),
		onTogglePlayPause: handleTogglePlayPause,
		onStart: handleStart,
		onToggleDryRun: handleToggleDryRun,
		onExportTrades: handleExportTrades,
		onShowShortcuts: handleShowShortcuts,
		canStart,
		canTogglePlayPause,
	});

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
					onStop={handleStopRequest}
					onRetry={handleRetry}
					onConfigure={handleConfigure}
					onDryRunChange={setDryRun}
				/>

				<StatsCards {...stats} />

				<div ref={chartRef}>
					<ChartCard
						history={probabilityHistory}
						marketPriceHistory={
							marketPrices
								? [{ timestamp: marketPrices.timestamp, price: marketPrices.yesPrice }]
								: []
						}
						events={events}
					/>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<div ref={eventsRef}>
						<EventsFeed events={events} />
					</div>
					<div ref={tradesRef}>
						<TradesFeed trades={trades} edgeThreshold={config.edgeThreshold / 100} />
					</div>
				</div>
			</main>

			<ConfigSheet
				open={settingsOpen}
				onOpenChange={setSettingsOpen}
				config={config}
				onSave={handleSaveConfig}
			/>

			<CommandPalette
				open={commandOpen}
				onOpenChange={setCommandOpen}
				botStatus={botStatus}
				dryRun={dryRun}
				onStart={handleStart}
				onPause={handlePause}
				onResume={handleResume}
				onStop={handleStopRequest}
				onToggleDryRun={handleToggleDryRun}
				onOpenConfig={() => setSettingsOpen(true)}
				onExportTrades={handleExportTrades}
				onExportChart={handleExportChart}
				onFocusChart={handleFocusChart}
				onFocusEvents={handleFocusEvents}
				onFocusTrades={handleFocusTrades}
				onShowShortcuts={handleShowShortcuts}
			/>

			<StopDialog
				open={stopDialogOpen}
				onOpenChange={setStopDialogOpen}
				onConfirm={handleStopConfirm}
				sessionPnL={stats.pnl}
				position={stats.position}
				positionDirection={positionDirection}
			/>
		</div>
	);
}
