import type { StrategyState, TradeSignal, TradingStrategy } from '../types';

export interface MarketMakerConfig {
	spreadBps: number;
	maxInventory: number;
	inventorySkewFactor: number;
	minEdgeBps: number;
	orderSize: number;
	rebalanceThreshold: number;
}

interface Quote {
	bid: number;
	ask: number;
	bidSize: number;
	askSize: number;
}

const DEFAULT_CONFIG: MarketMakerConfig = {
	spreadBps: 200,
	maxInventory: 100,
	inventorySkewFactor: 0.5,
	minEdgeBps: 50,
	orderSize: 10,
	rebalanceThreshold: 0.7,
};

export class MarketMakerStrategy implements TradingStrategy {
	readonly name = 'market-maker';

	private config: MarketMakerConfig;
	private state: StrategyState;
	private priceHistory: number[] = [];
	private volatility = 0;

	constructor(config: Partial<MarketMakerConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.state = {
			inventory: 0,
			bidPrice: null,
			askPrice: null,
			midPrice: 0.5,
			theoreticalMid: 0.5,
			pnl: 0,
			fills: 0,
		};
	}

	updateConfig(config: Record<string, unknown>): void {
		this.config = { ...this.config, ...(config as Partial<MarketMakerConfig>) };
	}

	getConfig(): MarketMakerConfig {
		return { ...this.config };
	}

	getState(): StrategyState {
		return { ...this.state };
	}

	private onPriceUpdate(yesPrice: number, noPrice: number): Quote {
		const mid = (yesPrice + (1 - noPrice)) / 2;
		this.state.midPrice = mid;

		this.priceHistory.push(mid);
		if (this.priceHistory.length > 100) {
			this.priceHistory.shift();
		}

		this.updateVolatility();
		this.updateTheoreticalMid();

		return this.generateQuotes();
	}

	private updateVolatility(): void {
		if (this.priceHistory.length < 10) {
			this.volatility = 0.02;
			return;
		}

		const returns: number[] = [];
		for (let i = 1; i < this.priceHistory.length; i++) {
			const prev = this.priceHistory[i - 1];
			const curr = this.priceHistory[i];
			if (prev && curr && prev > 0) {
				returns.push((curr - prev) / prev);
			}
		}

		if (returns.length === 0) {
			this.volatility = 0.02;
			return;
		}

		const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
		const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
		this.volatility = Math.sqrt(variance);
	}

	private updateTheoreticalMid(): void {
		if (this.priceHistory.length < 5) {
			this.state.theoreticalMid = this.state.midPrice;
			return;
		}

		const recentPrices = this.priceHistory.slice(-20);
		const ema = this.calculateEMA(recentPrices, 10);
		this.state.theoreticalMid = ema;
	}

	private calculateEMA(prices: number[], period: number): number {
		if (prices.length === 0) return 0.5;
		const k = 2 / (period + 1);
		let ema = prices[0] ?? 0.5;
		for (let i = 1; i < prices.length; i++) {
			ema = (prices[i] ?? ema) * k + ema * (1 - k);
		}
		return ema;
	}

	private generateQuotes(): Quote {
		const { spreadBps, maxInventory, inventorySkewFactor, orderSize } = this.config;

		const baseSpread = spreadBps / 10000;
		const volAdjustedSpread = baseSpread * (1 + this.volatility * 10);
		const halfSpread = volAdjustedSpread / 2;

		const inventoryRatio = this.state.inventory / maxInventory;
		const skew = inventoryRatio * inventorySkewFactor * halfSpread;

		const mid = this.state.theoreticalMid;
		let bid = mid - halfSpread - skew;
		let ask = mid + halfSpread - skew;

		bid = Math.max(0.01, Math.min(0.99, bid));
		ask = Math.max(0.01, Math.min(0.99, ask));

		if (ask <= bid) {
			ask = bid + 0.01;
		}

		const inventoryUtilization = Math.abs(this.state.inventory) / maxInventory;
		let bidSize = orderSize;
		let askSize = orderSize;

		if (this.state.inventory > 0) {
			bidSize = Math.round(orderSize * (1 - inventoryUtilization * 0.5));
			askSize = Math.round(orderSize * (1 + inventoryUtilization * 0.5));
		} else if (this.state.inventory < 0) {
			bidSize = Math.round(orderSize * (1 + inventoryUtilization * 0.5));
			askSize = Math.round(orderSize * (1 - inventoryUtilization * 0.5));
		}

		bidSize = Math.max(1, bidSize);
		askSize = Math.max(1, askSize);

		this.state.bidPrice = bid;
		this.state.askPrice = ask;

		return { bid, ask, bidSize, askSize };
	}

	evaluateTrade(marketYesPrice: number, marketNoPrice: number): TradeSignal | null {
		const quote = this.onPriceUpdate(marketYesPrice, marketNoPrice);
		const { maxInventory, rebalanceThreshold } = this.config;

		const inventoryUtilization = Math.abs(this.state.inventory) / maxInventory;
		if (inventoryUtilization > rebalanceThreshold) {
			return this.generateRebalanceSignal(marketYesPrice);
		}

		if (marketYesPrice < quote.bid && this.state.inventory < maxInventory) {
			return {
				side: 'BUY',
				price: marketYesPrice,
				size: quote.bidSize,
				edge: (quote.bid - marketYesPrice) * 100,
			};
		}

		if (marketYesPrice > quote.ask && this.state.inventory > -maxInventory) {
			return {
				side: 'SELL',
				price: marketYesPrice,
				size: quote.askSize,
				edge: (marketYesPrice - quote.ask) * 100,
			};
		}

		return null;
	}

	private generateRebalanceSignal(currentPrice: number): TradeSignal | null {
		const { orderSize } = this.config;

		if (this.state.inventory > 0) {
			return {
				side: 'SELL',
				price: currentPrice,
				size: Math.min(orderSize, this.state.inventory),
				edge: 0,
			};
		} else if (this.state.inventory < 0) {
			return {
				side: 'BUY',
				price: currentPrice,
				size: Math.min(orderSize, Math.abs(this.state.inventory)),
				edge: 0,
			};
		}

		return null;
	}

	onFill(side: 'BUY' | 'SELL', price: number, size: number): void {
		if (side === 'BUY') {
			this.state.inventory += size;
			this.state.pnl -= price * size;
		} else {
			this.state.inventory -= size;
			this.state.pnl += price * size;
		}
		this.state.fills++;
	}

	getUnrealizedPnL(currentPrice: number): number {
		return this.state.inventory * currentPrice;
	}

	reset(): void {
		this.state = {
			inventory: 0,
			bidPrice: null,
			askPrice: null,
			midPrice: 0.5,
			theoreticalMid: 0.5,
			pnl: 0,
			fills: 0,
		};
		this.priceHistory = [];
		this.volatility = 0;
	}
}
