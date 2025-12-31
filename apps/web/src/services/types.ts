export type EventType = 'trade' | 'fill' | 'quote_update' | 'price_move' | 'volume_spike' | 'spread_change';

export type Side = 'yes' | 'no' | 'unknown';

export interface TradeEvent {
	eventType: EventType;
	side: Side;
	timestamp: Date;
	eventId: string;
	details: unknown;
}

export interface MarketPrices {
	yesPrice: number;
	noPrice: number;
	timestamp: Date;
}

export interface TradeSignal {
	side: 'BUY' | 'SELL';
	price: number;
	size: number;
	edge: number;
}

export interface TradeExecution {
	id: string;
	side: 'BUY' | 'SELL';
	price: number;
	size: number;
	timestamp: Date;
	simulated: boolean;
	success: boolean;
	error?: string;
}

export interface ProbabilityUpdate {
	posterior: number;
	timestamp: Date;
	eventType?: EventType;
	side?: Side;
}

export interface TradingState {
	marketTicker: string | null;
	posterior: number;
	marketPrices: MarketPrices | null;
	events: TradeEvent[];
	trades: TradeExecution[];
	probabilityHistory: ProbabilityUpdate[];
	isRunning: boolean;
	isDryRun: boolean;
}

export type BotStatus = 'IDLE' | 'STARTING' | 'RUNNING' | 'PAUSED' | 'STOPPING' | 'STOPPED' | 'ERROR';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

export interface BotState {
	status: BotStatus;
	connection: ConnectionStatus;
	error: string | null;
	dryRun: boolean;
	elapsed: number;
	marketTicker: string | null;
}

export interface Stats {
	pnl: number;
	pnlPercent: number;
	tradeCount: number;
	winCount: number;
	lossCount: number;
	winRate: number;
	modelProbability: number;
	modelProbabilityDelta: number;
	marketPrice: number;
	yesPrice: number;
	noPrice: number;
	edge: number;
	edgeThreshold: number;
	position: number;
	exposure: number;
	eventCount: number;
}

export interface ChartDataPoint {
	timestamp: number;
	model: number;
	market: number;
	edge: number;
}

export interface Config {
	marketTicker: string;
	edgeThreshold: number;
	orderSize: number;
	maxPosition: number;
}

export interface KalshiMarket {
	ticker: string;
	title: string;
	subtitle: string;
	status: 'open' | 'closed' | 'settled';
	yesBid: number;
	yesAsk: number;
	yesPrice: number;
	noPrice: number;
	spread: number;
	spreadBps: number;
	volume: number;
	volume24h: number;
	openInterest: number;
	category: string;
	expirationDate: string;
}

export interface StrategyState {
	inventory: number;
	pnl: number;
	midPrice: number;
	theoreticalMid: number;
	bidPrice: number | null;
	askPrice: number | null;
	fills: number;
}

export interface TradingStrategy {
	readonly name: string;
	evaluateTrade(yesPrice: number, noPrice: number): TradeSignal | null;
	onFill(side: 'BUY' | 'SELL', price: number, size: number): void;
	getState(): StrategyState;
	getUnrealizedPnL(currentPrice: number): number;
	reset(): void;
	updateConfig(config: Record<string, unknown>): void;
}
