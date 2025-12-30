export type GameType = 'lol' | 'dota';

export type EventType = 'kill' | 'dragon' | 'baron' | 'tower' | 'inhibitor' | 'roshan';

export type Team = 'blue' | 'red' | 'radiant' | 'dire' | 'team1' | 'team2' | 'unknown';

export interface GameEvent {
	eventType: EventType;
	team: Team;
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
	team?: Team;
}

export interface TradingState {
	gameType: GameType | null;
	matchId: string | null;
	posterior: number;
	marketPrices: MarketPrices | null;
	events: GameEvent[];
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
	matchId: string | null;
	gameType: GameType | null;
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
	game: GameType;
	matchId: string;
	marketId?: string;
	edgeThreshold: number;
	orderSize: number;
	maxPosition: number;
	pollingInterval: number;
}
