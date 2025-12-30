import type { MarketPrices, TradeSignal } from './types';

const EDGE_THRESHOLD = Number(process.env.EDGE_THRESHOLD) || 0.05;
const DEFAULT_ORDER_SIZE = Number(process.env.ORDER_SIZE) || 10.0;

export function evaluateTrade(
	modelProb: number,
	marketPrices: MarketPrices,
	orderSize: number = DEFAULT_ORDER_SIZE
): TradeSignal | null {
	const { yesPrice, noPrice } = marketPrices;

	const yesEdge = modelProb - yesPrice;
	if (yesEdge > EDGE_THRESHOLD) {
		return {
			side: 'BUY',
			price: Math.min(yesPrice + 0.01, 0.99),
			size: orderSize,
			edge: yesEdge,
		};
	}

	const noEdge = 1 - modelProb - noPrice;
	if (noEdge > EDGE_THRESHOLD) {
		return {
			side: 'SELL',
			price: Math.min(noPrice + 0.01, 0.99),
			size: orderSize,
			edge: noEdge,
		};
	}

	return null;
}

export function formatEdge(edge: number): string {
	return `${(edge * 100).toFixed(2)}%`;
}

export function formatPrice(price: number): string {
	return `$${price.toFixed(3)}`;
}

export function formatProbability(prob: number): string {
	return `${(prob * 100).toFixed(1)}%`;
}
