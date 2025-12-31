import { tradingBot } from '@/services/trading-bot';

interface StreamController {
	_checkInterval?: ReturnType<typeof setInterval>;
	_unsubscribe?: () => void;
	_closed?: boolean;
}

function cleanupStream(ctrl: StreamController, controller: ReadableStreamDefaultController): void {
	if (ctrl._checkInterval) clearInterval(ctrl._checkInterval);
	if (ctrl._unsubscribe) ctrl._unsubscribe();
	if (ctrl._closed) return;
	ctrl._closed = true;
	try {
		controller.close();
	} catch {
		// Already closed
	}
}

export async function GET() {
	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		start(controller) {
			const sendEvent = (type: string, data: unknown) => {
				controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
			};

			const state = tradingBot.getState();
			sendEvent('connected', {
				marketTicker: state.marketTicker,
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

			(controller as unknown as { _unsubscribe?: () => void })._unsubscribe = tradingBot.subscribe((type, data) => {
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
							sendEvent('probability', data);
							break;
						case 'error':
							sendEvent('error', data);
							break;
						case 'marketClosed':
							sendEvent('marketClosed', data);
							break;
						case 'quotes':
							sendEvent('quotes', data);
							break;
						case 'tickerCount':
							sendEvent('tickerCount', data);
							break;
					}
				} catch {
					// Stream closed
				}
			});

			const ctrl = controller as unknown as StreamController;
			ctrl._checkInterval = setInterval(() => {
				const currentState = tradingBot.getState();
				if (currentState.status !== 'STOPPED' && currentState.status !== 'IDLE') return;
				cleanupStream(ctrl, controller);
			}, 5000);
		},
		cancel(controller) {
			const ctrl = controller as unknown as StreamController;
			cleanupStream(ctrl, controller);
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
