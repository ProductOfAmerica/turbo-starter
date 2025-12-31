'use client';

import { Toaster } from '@repo/ui/components/sonner';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChartCard } from '@/components/dashboard/chart-card';
import { CommandPalette } from '@/components/dashboard/command-palette';
import { ConfigSheet } from '@/components/dashboard/config-sheet';
import { EventsFeed } from '@/components/dashboard/events-feed';
import { Header } from '@/components/dashboard/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { StatusBar } from '@/components/dashboard/status-bar';
import { StopDialog } from '@/components/dashboard/stop-dialog';
import { TradesFeed } from '@/components/dashboard/trades-feed';
import { useBotState } from '@/hooks/use-bot-state';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useTradingStream } from '@/hooks/use-trading-stream';
import { useTradingToasts } from '@/hooks/use-trading-toasts';
import type { BotState, BotStatus, Config } from '@/services/types';

const DEFAULT_CONFIG: Config = {
	marketTicker: '',
	edgeThreshold: 5,
	orderSize: 10,
	maxPosition: 100,
};

interface DashboardClientProps {
	initialBotState: BotState | null;
	initialConfig: Config | null;
}

export function DashboardClient({ initialBotState, initialConfig }: DashboardClientProps) {
	const [commandOpen, setCommandOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [stopDialogOpen, setStopDialogOpen] = useState(false);
	const [config, setConfig] = useState<Config>(initialConfig || DEFAULT_CONFIG);

	const chartRef = useRef<HTMLDivElement>(null);
	const eventsRef = useRef<HTMLDivElement>(null);
	const tradesRef = useRef<HTMLDivElement>(null);
	const prevBotStatusRef = useRef<BotStatus | null>(initialBotState?.status || null);
	const wasConnectedRef = useRef(false);

	const {
		state: botState,
		start,
		stop,
		flatten,
		pause,
		resume,
		setDryRun,
		updateFromStream,
	} = useBotState(initialBotState);

	const {
		isConnected,
		posterior,
		marketPrices,
		quotes,
		events,
		trades,
		probabilityHistory,
		botState: streamBotState,
		tickerCount,
		connect,
		disconnect,
		reset,
	} = useTradingStream();

	useEffect(() => {
		if (streamBotState) {
			updateFromStream(streamBotState);
		}
	}, [streamBotState, updateFromStream]);

	const marketInfo = config.marketTicker || 'Select a market to begin';

	const stats = useMemo(() => {
		const yesPrice = marketPrices?.yesPrice ?? null;
		const noPrice = marketPrices?.noPrice ?? null;
		const edge = yesPrice !== null ? posterior - yesPrice : 0;

		const successfulTrades = trades.filter((t) => t.success);

		let realizedPnl = 0;
		let winCount = 0;
		for (const t of successfulTrades) {
			const tradePnl = (t.side === 'BUY' ? -t.price * t.size : t.price * t.size) * 0.1;
			realizedPnl += tradePnl;
			if (tradePnl > 0) winCount++;
		}

		const position = successfulTrades.reduce((sum, t) => {
			return sum + (t.side === 'BUY' ? t.size : -t.size);
		}, 0);

		const pnl = realizedPnl;

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
			eventCount: successfulTrades.length,
		};
	}, [posterior, marketPrices, trades, probabilityHistory, config.edgeThreshold]);

	const positionDirection = useMemo(() => {
		if (stats.position > 0) return 'LONG' as const;
		if (stats.position < 0) return 'SHORT' as const;
		return 'FLAT' as const;
	}, [stats.position]);

	const handleStart = useCallback(async () => {
		if (!config.marketTicker) return;
		try {
			await start(config.marketTicker, botState.dryRun);
			connect(config.marketTicker);
		} catch {
			// Error handled by useBotState
		}
	}, [start, connect, config.marketTicker, botState.dryRun]);

	const handlePause = useCallback(async () => {
		try {
			await pause();
		} catch {
			// Error handled by useBotState
		}
	}, [pause]);

	const handleResume = useCallback(async () => {
		try {
			await resume();
		} catch {
			// Error handled by useBotState
		}
	}, [resume]);

	const handleStopRequest = useCallback(() => {
		setStopDialogOpen(true);
	}, []);

	const handleStopConfirm = useCallback(async () => {
		try {
			await stop();
			disconnect();
			reset();
		} catch {
			// Error handled by useBotState
		}
	}, [stop, disconnect, reset]);

	const handleFlattenAndStop = useCallback(async () => {
		try {
			await flatten();
			disconnect();
			reset();
		} catch {
			// Error handled by useBotState
		}
	}, [flatten, disconnect, reset]);

	const handleRetry = useCallback(async () => {
		await handleStart();
	}, [handleStart]);

	const handleConfigure = useCallback(() => {
		setSettingsOpen(true);
	}, []);

	const handleToggleDryRun = useCallback(() => {
		setDryRun(!botState.dryRun);
	}, [setDryRun, botState.dryRun]);

	const handleDryRunChange = useCallback(
		(value: boolean) => {
			setDryRun(value);
		},
		[setDryRun]
	);

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

	const canStart = (botState.status === 'IDLE' || botState.status === 'STOPPED') && !!config.marketTicker;
	const canTogglePlayPause = botState.status === 'RUNNING' || botState.status === 'PAUSED';

	const handleTogglePlayPause = useCallback(() => {
		if (botState.status === 'RUNNING') {
			handlePause();
		} else if (botState.status === 'PAUSED') {
			handleResume();
		}
	}, [botState.status, handlePause, handleResume]);

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

	useTradingToasts({
		botStatus: botState.status,
		prevBotStatus: prevBotStatusRef.current,
		isConnected,
		wasConnected: wasConnectedRef.current,
		dryRun: botState.dryRun,
		trades,
		events,
		pnl: stats.pnl,
	});

	useEffect(() => {
		prevBotStatusRef.current = botState.status;
	}, [botState.status]);

	useEffect(() => {
		wasConnectedRef.current = isConnected;
	}, [isConnected]);

	useEffect(() => {
		if (botState.status === 'RUNNING' && botState.marketTicker && !isConnected) {
			connect(botState.marketTicker);
			setConfig((prev) => ({ ...prev, marketTicker: botState.marketTicker || '' }));
		}
	}, [botState.status, botState.marketTicker, isConnected, connect]);

	return (
		<div className="min-h-screen bg-background">
			<Header
				matchInfo={marketInfo}
				onCommandOpen={() => setCommandOpen(true)}
				onSettingsOpen={() => setSettingsOpen(true)}
			/>

			<main className="mx-auto max-w-7xl flex-1 space-y-6 overflow-auto p-6">
				<StatusBar
					status={botState.status}
					connection={isConnected ? 'connected' : botState.connection}
					elapsed={botState.elapsed}
					dryRun={botState.dryRun}
					tickerCount={tickerCount}
					canStart={canStart}
					missingMatchId={!config.marketTicker}
					onStart={handleStart}
					onPause={handlePause}
					onResume={handleResume}
					onStop={handleStopRequest}
					onRetry={handleRetry}
					onConfigure={handleConfigure}
					onDryRunChange={handleDryRunChange}
				/>

				<StatsCards {...stats} bidPrice={quotes?.bid} askPrice={quotes?.ask} />

				<div ref={chartRef}>
					<ChartCard
						history={probabilityHistory}
						marketPriceHistory={
							marketPrices ? [{ timestamp: marketPrices.timestamp, price: marketPrices.yesPrice }] : []
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

			<ConfigSheet open={settingsOpen} onOpenChange={setSettingsOpen} config={config} onSave={handleSaveConfig} />

			<CommandPalette
				open={commandOpen}
				onOpenChange={setCommandOpen}
				botStatus={botState.status}
				dryRun={botState.dryRun}
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
				onFlattenAndStop={handleFlattenAndStop}
				sessionPnL={stats.pnl}
				position={stats.position}
				positionDirection={positionDirection}
			/>

			<Toaster position="bottom-right" richColors closeButton />
		</div>
	);
}
