'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type { BotState, Stats } from '@/services/types';

interface UseBotStateReturn {
	state: BotState;
	stats: Stats;
	isLoading: boolean;
	error: string | null;
	start: (marketTicker: string, dryRun?: boolean) => Promise<void>;
	stop: () => Promise<void>;
	flatten: () => Promise<void>;
	pause: () => Promise<void>;
	resume: () => Promise<void>;
	setDryRun: (dryRun: boolean) => void;
	refresh: () => Promise<void>;
	updateFromStream: (streamState: BotState) => void;
}

const initialState: BotState = {
	status: 'IDLE',
	connection: 'disconnected',
	error: null,
	dryRun: true,
	elapsed: 0,
	marketTicker: null,
};

const initialStats: Stats = {
	pnl: 0,
	pnlPercent: 0,
	tradeCount: 0,
	winCount: 0,
	lossCount: 0,
	winRate: 0,
	modelProbability: 0.5,
	modelProbabilityDelta: 0,
	marketPrice: 0.5,
	yesPrice: 0.5,
	noPrice: 0.5,
	edge: 0,
	edgeThreshold: 0.05,
	position: 0,
	exposure: 0,
	eventCount: 0,
};

export function useBotState(serverState?: BotState | null): UseBotStateReturn {
	const [state, setState] = useState<BotState>(serverState || initialState);
	const [stats, setStats] = useState<Stats>(initialStats);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [, startTransition] = useTransition();

	const elapsedIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const startTimeRef = useRef<number | null>(null);
	const initialElapsedRef = useRef<number>(0);

	const fetchStatus = useCallback(async () => {
		try {
			const response = await fetch('/api/bot/status');
			if (!response.ok) {
				throw new Error('Failed to fetch status');
			}
			const data = await response.json();
			startTransition(() => {
				setState(data.state);
				setStats(data.stats);
			});
			return data;
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch status');
			return null;
		}
	}, []);

	const updateFromStream = useCallback((streamState: BotState) => {
		setState(streamState);
	}, []);

	useEffect(() => {
		initialElapsedRef.current = state.elapsed;
	}, [state.elapsed]);

	useEffect(() => {
		if (state.status === 'RUNNING') {
			if (!startTimeRef.current) {
				startTimeRef.current = Date.now() - initialElapsedRef.current * 1000;
			}

			elapsedIntervalRef.current = setInterval(() => {
				if (!startTimeRef.current) return;
				const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
				setState((prev) => ({ ...prev, elapsed }));
			}, 1000);
		} else {
			if (elapsedIntervalRef.current) {
				clearInterval(elapsedIntervalRef.current);
				elapsedIntervalRef.current = null;
			}
			if (state.status === 'IDLE' || state.status === 'STOPPED') {
				startTimeRef.current = null;
			}
		}

		return () => {
			if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
		};
	}, [state.status]);

	useEffect(() => {
		fetchStatus();
	}, [fetchStatus]);

	const start = useCallback(async (marketTicker: string, dryRun = true) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/bot/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ marketTicker, dryRun }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to start bot');
			}

			startTimeRef.current = Date.now();
			startTransition(() => setState(data.state));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to start bot');
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const stop = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/bot/stop', { method: 'POST' });
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to stop bot');
			}

			startTimeRef.current = null;
			startTransition(() => setState(data.state));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to stop bot');
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const flatten = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/bot/flatten', { method: 'POST' });
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to flatten and stop');
			}

			startTimeRef.current = null;
			startTransition(() => setState(data.state));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to flatten and stop');
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const pause = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/bot/pause', { method: 'POST' });
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to pause bot');
			}

			startTransition(() => setState(data.state));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to pause bot');
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const resume = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/bot/resume', { method: 'POST' });
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to resume bot');
			}

			startTransition(() => setState(data.state));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to resume bot');
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const setDryRun = useCallback(async (dryRun: boolean) => {
		setState((prev) => ({ ...prev, dryRun }));
		try {
			await fetch('/api/bot/dry-run', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ dryRun }),
			});
		} catch {
			// Ignore errors, local state is already updated
		}
	}, []);

	const refresh = useCallback(async () => {
		await fetchStatus();
	}, [fetchStatus]);

	return {
		state,
		stats,
		isLoading,
		error,
		start,
		stop,
		flatten,
		pause,
		resume,
		setDryRun,
		refresh,
		updateFromStream,
	};
}
