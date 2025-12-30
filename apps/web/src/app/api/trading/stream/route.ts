import { parseEvents, isMatchComplete } from '@/services/event-parser';
import { fetchMarketPrices } from '@/services/polymarket';
import { BayesianPredictor } from '@/services/predictor';
import { evaluateTrade } from '@/services/trade-evaluator';
import type { GameType, TradeExecution } from '@/services/types';

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL) || 2000;

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const gameType = searchParams.get('gameType') as GameType;
	const matchId = searchParams.get('matchId');
	const marketId = searchParams.get('marketId') || process.env.POLYMARKET_ID;
	const isDryRun = process.env.DRY_RUN === 'true';

	if (!gameType || !matchId) {
		return new Response(JSON.stringify({ error: 'Missing gameType or matchId' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const encoder = new TextEncoder();
	const predictor = new BayesianPredictor();

	const stream = new ReadableStream({
		async start(controller) {
			const sendEvent = (type: string, data: unknown) => {
				controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
			};

			sendEvent('connected', { gameType, matchId, isDryRun });

			let isRunning = true;

			const poll = async () => {
				while (isRunning) {
					try {
						const gameApiUrl =
							gameType === 'lol'
								? `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/games/lol?matchId=${matchId}`
								: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/games/dota?matchId=${matchId}`;

						const gameResponse = await fetch(gameApiUrl);
						if (!gameResponse.ok) {
							sendEvent('error', { message: 'Failed to fetch game data' });
							await sleep(POLL_INTERVAL);
							continue;
						}

						const gameData = await gameResponse.json();

						if (isMatchComplete(gameData, gameType)) {
							sendEvent('matchComplete', { posterior: predictor.getPosterior() });
							isRunning = false;
							break;
						}

						const events = parseEvents(gameData, gameType);
						for (const event of events) {
							if (predictor.update(event)) {
								sendEvent('event', {
									...event,
									posterior: predictor.getPosterior(),
								});
							}
						}

						if (marketId) {
							const prices = await fetchMarketPrices(marketId);
							if (prices) {
								sendEvent('prices', {
									...prices,
									timestamp: new Date().toISOString(),
								});

								const signal = evaluateTrade(predictor.getPosterior(), {
									yesPrice: prices.yesPrice,
									noPrice: prices.noPrice,
									timestamp: new Date(),
								});

								if (signal) {
									const execution: TradeExecution = {
										id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
										side: signal.side,
										price: signal.price,
										size: signal.size,
										timestamp: new Date(),
										simulated: isDryRun,
										success: true,
									};

									sendEvent('trade', {
										signal,
										execution,
									});
								}
							}
						}

						sendEvent('state', {
							posterior: predictor.getPosterior(),
							updateCount: predictor.getUpdateCount(),
							history: predictor.getHistory().slice(-50),
						});
					} catch (error) {
						sendEvent('error', {
							message: error instanceof Error ? error.message : 'Unknown error',
						});
					}

					await sleep(POLL_INTERVAL);
				}

				controller.close();
			};

			poll();
		},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	});
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
