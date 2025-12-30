import { tradingBot } from '@/services/trading-bot';

export async function GET() {
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		start(controller) {
			const sendEvent = (type: string, data: unknown) => {
				controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
			};

			const state = tradingBot.getState();
			sendEvent('connected', {
				gameType: state.gameType,
				matchId: state.matchId,
				isDryRun: state.dryRun,
			});

			for (const event of tradingBot.getEvents()) {
				sendEvent('event', event);
			}

			for (const trade of tradingBot.getTrades()) {
				sendEvent('trade', { execution: trade });
			}

			const prices = tradingBot.getMarketPrices();
			if (prices) {
				sendEvent('prices', {
					yesPrice: prices.yesPrice,
					noPrice: prices.noPrice,
					timestamp: prices.timestamp.toISOString(),
				});
			}

			const history = tradingBot.getProbabilityHistory();
			if (history.length > 0) {
				sendEvent('state', {
					posterior: history[history.length - 1]?.posterior ?? 0.5,
					updateCount: history.length,
					history: history.slice(-50),
				});
			}

			const unsubscribe = tradingBot.subscribe((type, data) => {
				try {
					switch (type) {
						case 'stateChange':
							sendEvent('botState', data);
							break;
						case 'event':
							sendEvent('event', data);
							break;
						case 'prices':
							sendEvent('prices', data);
							break;
						case 'trade':
							sendEvent('trade', data);
							break;
						case 'probability':
							sendEvent('state', {
								posterior: (data as { posterior: number }).posterior,
								updateCount: tradingBot.getProbabilityHistory().length,
								history: tradingBot.getProbabilityHistory().slice(-50),
							});
							break;
						case 'error':
							sendEvent('error', data);
							break;
						case 'matchComplete':
							sendEvent('matchComplete', data);
							break;
					}
				} catch {
					// Stream closed
				}
			});

			const checkInterval = setInterval(() => {
				const currentState = tradingBot.getState();
				if (currentState.status === 'STOPPED' || currentState.status === 'IDLE') {
					clearInterval(checkInterval);
					unsubscribe();
					controller.close();
				}
			}, 5000);

			return () => {
				clearInterval(checkInterval);
				unsubscribe();
			};
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
