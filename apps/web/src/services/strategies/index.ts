import type { TradingStrategy } from '../types';
import { MarketMakerStrategy } from './market-maker';
import { MomentumStrategy } from './momentum';

export type StrategyName = 'market-maker' | 'momentum';

const strategyFactories: Record<StrategyName, () => TradingStrategy> = {
	'market-maker': () => new MarketMakerStrategy(),
	momentum: () => new MomentumStrategy(),
};

export function createStrategy(name: StrategyName): TradingStrategy {
	const factory = strategyFactories[name];
	if (!factory) {
		throw new Error(`Unknown strategy: ${name}`);
	}
	return factory();
}

export function getAvailableStrategies(): StrategyName[] {
	return Object.keys(strategyFactories) as StrategyName[];
}

export { MarketMakerStrategy } from './market-maker';
export { MomentumStrategy } from './momentum';
