'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import {
	LiveFeed,
	MarketPrices,
	MatchSelector,
	ProbabilityChart,
	StatsCards,
	TradeLog,
} from '@/components/dashboard';
import { useTradingStream } from '@/hooks/use-trading-stream';
import type { GameType } from '@/services/types';

const isDryRun = process.env.NEXT_PUBLIC_DRY_RUN === 'true';

export default function Home() {
	const {
		isConnected,
		posterior,
		marketPrices,
		events,
		trades,
		probabilityHistory,
		error,
		connect,
		disconnect,
		reset,
	} = useTradingStream();

	const handleStart = (gameType: GameType, matchId: string, marketId: string) => {
		reset();
		connect(gameType, matchId, marketId || undefined);
	};

	const handleStop = () => {
		disconnect();
	};

	return (
		<div className="min-h-screen bg-background">
			<header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border">
				<div className="container mx-auto px-4 sm:px-6 py-4">
					<div className="flex items-center justify-between">
						<h1 className="text-lg font-semibold">Esports Trading Bot</h1>
						<ThemeToggle />
					</div>
				</div>
			</header>

			<main className="container mx-auto px-6 py-8 space-y-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-3xl font-bold">Trading Dashboard</h2>
						<p className="text-muted-foreground">
							Real-time esports prediction trading
						</p>
					</div>
					{error && (
						<div className="text-sm text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg">
							{error}
						</div>
					)}
				</div>

				<MatchSelector
					isRunning={isConnected}
					isDryRun={isDryRun}
					onStart={handleStart}
					onStop={handleStop}
				/>

				<StatsCards
					posterior={posterior}
					yesPrice={marketPrices?.yesPrice ?? null}
					noPrice={marketPrices?.noPrice ?? null}
					eventCount={events.length}
					tradeCount={trades.length}
				/>

				<div className="grid gap-6 lg:grid-cols-2">
					<ProbabilityChart
						history={probabilityHistory}
						marketPrice={marketPrices?.yesPrice}
					/>
					<MarketPrices
						yesPrice={marketPrices?.yesPrice ?? null}
						noPrice={marketPrices?.noPrice ?? null}
						lastUpdate={marketPrices?.timestamp ?? null}
					/>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<LiveFeed events={events} />
					<TradeLog trades={trades} />
				</div>
			</main>
		</div>
	);
}
