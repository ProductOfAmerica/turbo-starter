import { isMatchComplete, parseEvents } from './event-parser';
import { fetchMarketPrices, placeOrder } from './polymarket';
import { BayesianPredictor } from './predictor';
import { evaluateTrade } from './trade-evaluator';
import type {
	BotState,
	BotStatus,
	Config,
	ConnectionStatus,
	GameEvent,
	GameType,
	MarketPrices,
	ProbabilityUpdate,
	Stats,
	TradeExecution,
} from './types';

type BotEventType = 'stateChange' | 'event' | 'prices' | 'trade' | 'probability' | 'error' | 'matchComplete';

type BotEventListener = (type: BotEventType, data: unknown) => void;

class TradingBotService {
	private status: BotStatus = 'IDLE';
	private connection: ConnectionStatus = 'disconnected';
	private error: string | null = null;
	private dryRun = true;
	private startTime: number | null = null;
	private matchId: string | null = null;
	private marketId: string | null = null;
	private gameType: GameType | null = null;

	private predictor: BayesianPredictor | null = null;
	private events: GameEvent[] = [];
	private trades: TradeExecution[] = [];
	private probabilityHistory: ProbabilityUpdate[] = [];
	private marketPrices: MarketPrices | null = null;

	private pollInterval: NodeJS.Timeout | null = null;
	private config: Config = {
		game: 'lol',
		matchId: '',
		edgeThreshold: 5,
		orderSize: 10,
		maxPosition: 100,
		pollingInterval: 2000,
	};

	private listeners: Set<BotEventListener> = new Set();

	subscribe(listener: BotEventListener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private emit(type: BotEventType, data: unknown): void {
		for (const listener of this.listeners) {
			listener(type, data);
		}
	}

	private setStatus(status: BotStatus): void {
		this.status = status;
		this.emit('stateChange', this.getState());
	}

	private setConnection(connection: ConnectionStatus): void {
		this.connection = connection;
		this.emit('stateChange', this.getState());
	}

	getState(): BotState {
		return {
			status: this.status,
			connection: this.connection,
			error: this.error,
			dryRun: this.dryRun,
			elapsed: this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
			matchId: this.matchId,
			gameType: this.gameType,
		};
	}

	getStats(): Stats {
		const yesPrice = this.marketPrices?.yesPrice ?? 0.5;
		const noPrice = this.marketPrices?.noPrice ?? 0.5;
		const posterior = this.predictor?.getPosterior() ?? 0.5;
		const edge = yesPrice !== null ? posterior - yesPrice : 0;

		const successfulTrades = this.trades.filter((t) => t.success);
		const winCount = successfulTrades.length;
		const lossCount = this.trades.length - winCount;

		const pnl = this.trades.reduce((sum, t) => {
			if (!t.success) return sum;
			return sum + (t.side === 'BUY' ? -t.price * t.size : t.price * t.size);
		}, 0);

		const position = this.trades.reduce((sum, t) => {
			if (!t.success) return sum;
			return sum + (t.side === 'BUY' ? t.size : -t.size);
		}, 0);

		const exposure = Math.abs(position) * yesPrice;

		const prevProbability =
			this.probabilityHistory.length > 1
				? (this.probabilityHistory[this.probabilityHistory.length - 2]?.posterior ?? posterior)
				: posterior;
		const modelProbabilityDelta = posterior - prevProbability;

		return {
			pnl,
			pnlPercent: exposure > 0 ? (pnl / exposure) * 100 : 0,
			tradeCount: this.trades.length,
			winCount,
			lossCount,
			winRate: this.trades.length > 0 ? winCount / this.trades.length : 0,
			modelProbability: posterior,
			modelProbabilityDelta,
			marketPrice: yesPrice,
			yesPrice,
			noPrice,
			edge,
			edgeThreshold: this.config.edgeThreshold / 100,
			position,
			exposure,
			eventCount: this.events.length,
		};
	}

	getEvents(): GameEvent[] {
		return [...this.events];
	}

	getTrades(): TradeExecution[] {
		return [...this.trades];
	}

	getProbabilityHistory(): ProbabilityUpdate[] {
		return [...this.probabilityHistory];
	}

	getMarketPrices(): MarketPrices | null {
		return this.marketPrices;
	}

	getConfig(): Config {
		return { ...this.config };
	}

	setConfig(config: Config): void {
		this.config = { ...config };
	}

	async start(gameType: GameType, matchId: string, marketId?: string, dryRun = true): Promise<void> {
		if (this.status !== 'IDLE' && this.status !== 'STOPPED') {
			throw new Error(`Cannot start bot from ${this.status} state`);
		}

		this.setStatus('STARTING');
		this.gameType = gameType;
		this.matchId = matchId;
		this.marketId = marketId ?? null;
		this.dryRun = dryRun;
		this.error = null;

		this.predictor = new BayesianPredictor();
		this.events = [];
		this.trades = [];
		this.probabilityHistory = [{ posterior: 0.5, timestamp: new Date() }];
		this.marketPrices = null;

		try {
			this.startTime = Date.now();
			this.setConnection('connected');
			this.setStatus('RUNNING');

			this.startPolling();
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Failed to start bot';
			this.setStatus('ERROR');
			this.emit('error', { message: this.error });
		}
	}

	async stop(): Promise<void> {
		if (this.status !== 'RUNNING' && this.status !== 'PAUSED') {
			throw new Error(`Cannot stop bot from ${this.status} state`);
		}

		this.setStatus('STOPPING');
		this.stopPolling();

		await new Promise((resolve) => setTimeout(resolve, 500));

		this.setConnection('disconnected');
		this.startTime = null;
		this.setStatus('STOPPED');
	}

	pause(): void {
		if (this.status !== 'RUNNING') {
			throw new Error(`Cannot pause bot from ${this.status} state`);
		}

		this.stopPolling();
		this.setStatus('PAUSED');
	}

	resume(): void {
		if (this.status !== 'PAUSED') {
			throw new Error(`Cannot resume bot from ${this.status} state`);
		}

		this.setStatus('RUNNING');
		this.startPolling();
	}

	setDryRun(dryRun: boolean): void {
		this.dryRun = dryRun;
		this.emit('stateChange', this.getState());
	}

	private startPolling(): void {
		if (this.pollInterval) {
			clearInterval(this.pollInterval);
		}

		this.poll();
		this.pollInterval = setInterval(() => this.poll(), this.config.pollingInterval);
	}

	private stopPolling(): void {
		if (this.pollInterval) {
			clearInterval(this.pollInterval);
			this.pollInterval = null;
		}
	}

	private async poll(): Promise<void> {
		if (this.status !== 'RUNNING') return;

		try {
			const gameApiUrl =
				this.gameType === 'lol'
					? `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/games/lol?matchId=${this.matchId}`
					: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/games/dota?matchId=${this.matchId}`;

			const gameResponse = await fetch(gameApiUrl);
			if (!gameResponse.ok) {
				this.emit('error', { message: 'Failed to fetch game data' });
				return;
			}

			const gameData = await gameResponse.json();

			if (this.gameType && isMatchComplete(gameData, this.gameType)) {
				this.emit('matchComplete', { posterior: this.predictor?.getPosterior() ?? 0.5 });
				await this.stop();
				return;
			}

			if (this.gameType && this.predictor) {
				const events = parseEvents(gameData, this.gameType);
				for (const event of events) {
					if (this.predictor.update(event)) {
						this.events.push(event);
						const posterior = this.predictor.getPosterior();
						this.probabilityHistory.push({
							posterior,
							timestamp: new Date(),
							eventType: event.eventType,
							team: event.team,
						});
						this.emit('event', { ...event, posterior });
						this.emit('probability', { posterior, timestamp: new Date() });
					}
				}
			}

			if (this.marketId) {
				const prices = await fetchMarketPrices(this.marketId);
				if (prices) {
					this.marketPrices = { ...prices, timestamp: new Date() };
					this.emit('prices', { ...prices, timestamp: new Date().toISOString() });

					if (this.predictor) {
						const signal = evaluateTrade(this.predictor.getPosterior(), {
							yesPrice: prices.yesPrice,
							noPrice: prices.noPrice,
							timestamp: new Date(),
						});

						if (signal && Math.abs(signal.edge) >= this.config.edgeThreshold / 100) {
							const position = this.getStats().position;
							if (Math.abs(position) < this.config.maxPosition) {
								const execution = await placeOrder(
									{ ...signal, size: Math.min(signal.size, this.config.orderSize) },
									this.dryRun
								);
								this.trades.push(execution);
								this.emit('trade', { signal, execution });
							}
						}
					}
				}
			}
		} catch (err) {
			this.emit('error', { message: err instanceof Error ? err.message : 'Unknown error' });
		}
	}

	reset(): void {
		this.stopPolling();
		this.status = 'IDLE';
		this.connection = 'disconnected';
		this.error = null;
		this.startTime = null;
		this.matchId = null;
		this.marketId = null;
		this.gameType = null;
		this.predictor = null;
		this.events = [];
		this.trades = [];
		this.probabilityHistory = [];
		this.marketPrices = null;
		this.emit('stateChange', this.getState());
	}
}

export const tradingBot = new TradingBotService();
