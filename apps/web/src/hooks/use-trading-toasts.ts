'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { BotStatus, TradeEvent, TradeExecution } from '@/services/types';

interface TradingToastsConfig {
	botStatus: BotStatus;
	prevBotStatus: BotStatus | null;
	isConnected: boolean;
	wasConnected: boolean;
	dryRun: boolean;
	trades: TradeExecution[];
	events: TradeEvent[];
	pnl: number;
}

const SIGNIFICANT_EVENTS = ['volume_spike', 'spread_change'];

export function useTradingToasts({
	botStatus,
	prevBotStatus,
	isConnected,
	wasConnected,
	dryRun,
	trades,
	events,
	pnl,
}: TradingToastsConfig) {
	const prevTradeCountRef = useRef(trades.length);
	const prevEventCountRef = useRef(events.length);

	useEffect(() => {
		if (prevBotStatus === null) return;

		if (botStatus === 'RUNNING' && prevBotStatus !== 'RUNNING') {
			toast.success('Bot Started', {
				description: dryRun ? 'Running in simulation mode' : 'Live trading enabled',
			});
		}

		if (botStatus === 'STOPPED' && prevBotStatus === 'STOPPING') {
			const pnlFormatted = pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`;
			toast.info('Bot Stopped', {
				description: `Session P&L: ${pnlFormatted}`,
			});
		}

		if (botStatus === 'PAUSED' && prevBotStatus === 'RUNNING') {
			toast.info('Bot Paused');
		}

		if (botStatus === 'ERROR' && prevBotStatus !== 'ERROR') {
			toast.error('Bot Error', {
				description: 'An error occurred. Check the dashboard for details.',
			});
		}
	}, [botStatus, prevBotStatus, dryRun, pnl]);

	useEffect(() => {
		if (isConnected && !wasConnected) {
			toast.success('Connected', {
				description: 'Real-time data stream established',
			});
		}

		if (!isConnected && wasConnected) {
			toast.warning('Connection Lost', {
				description: 'Attempting to reconnect...',
			});
		}
	}, [isConnected, wasConnected]);

	useEffect(() => {
		if (trades.length > prevTradeCountRef.current) {
			const newTrades = trades.slice(prevTradeCountRef.current);
			for (const trade of newTrades) {
				if (trade.success) {
					const side = trade.side === 'BUY' ? 'Bought' : 'Sold';
					toast.success(`Trade Executed`, {
						description: `${side} ${trade.size} @ ${(trade.price * 100).toFixed(1)}¢${trade.simulated ? ' (simulated)' : ''}`,
					});
				} else {
					toast.error('Trade Failed', {
						description: trade.error || 'Unknown error',
					});
				}
			}
		}
		prevTradeCountRef.current = trades.length;
	}, [trades]);

	useEffect(() => {
		if (events.length > prevEventCountRef.current) {
			const newEvents = events.slice(prevEventCountRef.current);
			for (const event of newEvents) {
				const isSignificant = SIGNIFICANT_EVENTS.includes(event.eventType);
				if (isSignificant) {
					const sideName = event.side === 'yes' ? 'YES' : 'NO';
					toast(`${sideName}: ${event.eventType.toUpperCase().replace('_', ' ')}`, {
						description: `Market activity detected`,
					});
				}
			}
		}
		prevEventCountRef.current = events.length;
	}, [events]);
}
