'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { BotState, MarketPrices, ProbabilityUpdate, TradeEvent, TradeExecution } from '@/services/types';

interface Quotes {
	bid: number | null;
	ask: number | null;
	mid: number;
	inventory: number;
}

interface TradingStreamState {
	isConnected: boolean;
	posterior: number;
	marketPrices: MarketPrices | null;
	quotes: Quotes | null;
	events: TradeEvent[];
	trades: TradeExecution[];
	probabilityHistory: ProbabilityUpdate[];
	botState: BotState | null;
	tickerCount: number;
	error: string | null;
}

export function useTradingStream() {
	const [state, setState] = useState<TradingStreamState>({
		isConnected: false,
		posterior: 0.5,
		marketPrices: null,
		quotes: null,
		events: [],
		trades: [],
		probabilityHistory: [{ posterior: 0.5, timestamp: new Date() }],
		botState: null,
		tickerCount: 0,
		error: null,
	});

	const eventSourceRef = useRef<EventSource | null>(null);

	const connect = useCallback((marketTicker: string) => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
		}

		const params = new URLSearchParams({
			marketTicker,
		});

		const eventSource = new EventSource(`/api/trading/stream?${params.toString()}`);
		eventSourceRef.current = eventSource;

		eventSource.onopen = () => {
			setState((prev) => ({ ...prev, isConnected: true, error: null }));
		};

		eventSource.onerror = () => {
			setState((prev) => ({
				...prev,
				isConnected: false,
				error: 'Connection lost. Attempting to reconnect...',
			}));
		};

		eventSource.addEventListener('connected', (e) => {
			const data = JSON.parse(e.data);
			console.log('Connected:', data);
		});

		eventSource.addEventListener('event', (e) => {
			const data = JSON.parse(e.data);
			setState((prev) => ({
				...prev,
				events: [...prev.events, data],
				posterior: data.posterior,
			}));
		});

		eventSource.addEventListener('prices', (e) => {
			const data = JSON.parse(e.data);
			setState((prev) => ({
				...prev,
				marketPrices: {
					yesPrice: data.yesPrice,
					noPrice: data.noPrice,
					timestamp: new Date(data.timestamp),
				},
			}));
		});

		eventSource.addEventListener('probability', (e) => {
			const data = JSON.parse(e.data);
			setState((prev) => ({
				...prev,
				posterior: data.posterior,
				probabilityHistory: [
					...prev.probabilityHistory,
					{ posterior: data.posterior, timestamp: new Date(data.timestamp) },
				],
			}));
		});

		eventSource.addEventListener('trade', (e) => {
			const data = JSON.parse(e.data);
			setState((prev) => ({
				...prev,
				trades: [...prev.trades, data.execution],
			}));
		});

		eventSource.addEventListener('quotes', (e) => {
			const data = JSON.parse(e.data);
			setState((prev) => ({
				...prev,
				quotes: {
					bid: data.bid,
					ask: data.ask,
					mid: data.mid,
					inventory: data.inventory,
				},
			}));
		});

		eventSource.addEventListener('botState', (e) => {
			const data = JSON.parse(e.data);
			setState((prev) => ({
				...prev,
				botState: data,
			}));
		});

		eventSource.addEventListener('tickerCount', (e) => {
			const data = JSON.parse(e.data);
			setState((prev) => ({
				...prev,
				tickerCount: data.count,
			}));
		});

		eventSource.addEventListener('state', (e) => {
			const data = JSON.parse(e.data);
			setState((prev) => ({
				...prev,
				posterior: data.posterior,
				probabilityHistory: data.history.map((h: { posterior: number; timestamp: string }) => ({
					...h,
					timestamp: new Date(h.timestamp),
				})),
			}));
		});

		eventSource.addEventListener('marketClosed', (e) => {
			const data = JSON.parse(e.data);
			console.log('Market closed:', data);
			eventSource.close();
			setState((prev) => ({ ...prev, isConnected: false }));
		});

		eventSource.addEventListener('error', (e: MessageEvent) => {
			if (e.data) {
				try {
					const data = JSON.parse(e.data);
					setState((prev) => ({ ...prev, error: data.message }));
				} catch {
					// Ignore parse errors from non-JSON error events
				}
			}
		});
	}, []);

	const disconnect = useCallback(() => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
			eventSourceRef.current = null;
		}
		setState((prev) => ({ ...prev, isConnected: false }));
	}, []);

	const reset = useCallback(() => {
		disconnect();
		setState({
			isConnected: false,
			posterior: 0.5,
			marketPrices: null,
			quotes: null,
			events: [],
			trades: [],
			probabilityHistory: [{ posterior: 0.5, timestamp: new Date() }],
			botState: null,
			tickerCount: 0,
			error: null,
		});
	}, [disconnect]);

	useEffect(() => {
		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
			}
		};
	}, []);

	return {
		...state,
		connect,
		disconnect,
		reset,
	};
}
