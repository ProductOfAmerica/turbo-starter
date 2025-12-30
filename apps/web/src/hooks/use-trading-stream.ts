'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameEvent, GameType, MarketPrices, ProbabilityUpdate, TradeExecution } from '@/services/types';

interface TradingStreamState {
	isConnected: boolean;
	posterior: number;
	marketPrices: MarketPrices | null;
	events: GameEvent[];
	trades: TradeExecution[];
	probabilityHistory: ProbabilityUpdate[];
	error: string | null;
}

export function useTradingStream() {
	const [state, setState] = useState<TradingStreamState>({
		isConnected: false,
		posterior: 0.5,
		marketPrices: null,
		events: [],
		trades: [],
		probabilityHistory: [{ posterior: 0.5, timestamp: new Date() }],
		error: null,
	});

	const eventSourceRef = useRef<EventSource | null>(null);

	const connect = useCallback((gameType: GameType, matchId: string, marketId?: string) => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
		}

		const params = new URLSearchParams({
			gameType,
			matchId,
		});
		if (marketId) {
			params.set('marketId', marketId);
		}

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

		eventSource.addEventListener('trade', (e) => {
			const data = JSON.parse(e.data);
			setState((prev) => ({
				...prev,
				trades: [...prev.trades, data.execution],
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

		eventSource.addEventListener('matchComplete', (e) => {
			const data = JSON.parse(e.data);
			console.log('Match complete:', data);
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
			events: [],
			trades: [],
			probabilityHistory: [{ posterior: 0.5, timestamp: new Date() }],
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
