import type { StrategyState, TradeSignal, TradingStrategy } from '../types';

export interface MomentumConfig {
	lookbackPeriod: number;
	momentumThreshold: number;
	orderSize: number;
	maxInventory: number;
}

const DEFAULT_CONFIG: MomentumConfig = {
	lookbackPeriod: 5,
	momentumThreshold: 0.02,
	orderSize: 10,
	maxInventory: 100,
};

export class MomentumStrategy implements TradingStrategy {
	readonly name = 'momentum';

	private config: MomentumConfig;
	private state: StrategyState;
	private priceHistory: number[] = [];

	constructor(config: Partial<MomentumConfig> = {}) {
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
		this.config = { ...this.config, ...(config as Partial<MomentumConfig>) };
	}

	getState(): StrategyState {
		return { ...this.state };
	}

	evaluateTrade(yesPrice: number, noPrice: number): TradeSignal | null {
		const mid = (yesPrice + (1 - noPrice)) / 2;
		this.state.midPrice = mid;
		this.state.theoreticalMid = mid;

		this.priceHistory.push(mid);
		if (this.priceHistory.length > 100) {
			this.priceHistory.shift();
		}

		const { lookbackPeriod, momentumThreshold, orderSize, maxInventory } = this.config;

		if (this.priceHistory.length < lookbackPeriod + 1) {
			return null;
		}

		const oldPrice = this.priceHistory[this.priceHistory.length - lookbackPeriod - 1];
		const currentPrice = this.priceHistory[this.priceHistory.length - 1];

		if (oldPrice === undefined || currentPrice === undefined) {
			return null;
		}

		const momentum = (currentPrice - oldPrice) / oldPrice;

		this.state.bidPrice = mid - 0.01;
		this.state.askPrice = mid + 0.01;

		if (momentum > momentumThreshold && this.state.inventory < maxInventory) {
			return {
				side: 'BUY',
				price: yesPrice,
				size: orderSize,
				edge: momentum * 100,
			};
		}

		if (momentum < -momentumThreshold && this.state.inventory > -maxInventory) {
			return {
				side: 'SELL',
				price: yesPrice,
				size: orderSize,
				edge: Math.abs(momentum) * 100,
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
	}
}
