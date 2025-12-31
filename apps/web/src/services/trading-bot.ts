import { fetchMarketPrices, initializeClient, placeOrder } from './kalshi';
import { kalshiWs, type TickerUpdate } from './kalshi-ws';
import { scenarioRunner } from './scenario-runner';
import { createStrategy, getAvailableStrategies, type StrategyName } from './strategies';
import type {
	BotState,
	BotStatus,
	Config,
	ConnectionStatus,
	MarketPrices,
	ProbabilityUpdate,
	Stats,
	StrategyState,
	TradeEvent,
	TradeExecution,
	TradingStrategy,
} from './types';

type BotEventType =
	| 'stateChange'
	| 'event'
	| 'prices'
	| 'trade'
	| 'probability'
	| 'error'
	| 'marketClosed'
	| 'quotes'
	| 'tickerCount';

type BotEventListener = (type: BotEventType, data: unknown) => void;

class TradingBotService {
	private status: BotStatus = 'IDLE';
	private connection: ConnectionStatus = 'disconnected';
	private error: string | null = null;
	private dryRun = true;
	private startTime: number | null = null;
	private marketTicker: string | null = null;

	private events: TradeEvent[] = [];
	private trades: TradeExecution[] = [];
	private probabilityHistory: ProbabilityUpdate[] = [];
	private marketPrices: MarketPrices | null = null;

	private wsTickerHandler: ((data: TickerUpdate) => void) | null = null;
	private config: Config = {
		marketTicker: '',
		edgeThreshold: 5,
		orderSize: 10,
		maxPosition: 100,
	};

	private strategy: TradingStrategy;
	private listeners: Set<BotEventListener> = new Set();

	constructor() {
		this.strategy = createStrategy('market-maker');
	}

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
			marketTicker: this.marketTicker,
		};
	}

	getStats(): Stats {
		const strategyState = this.strategy.getState();
		const yesPrice = this.marketPrices?.yesPrice ?? 0.5;
		const noPrice = this.marketPrices?.noPrice ?? 0.5;

		const successfulTrades = this.trades.filter((t) => t.success);
		const wins = successfulTrades.filter((t) => {
			const avgPrice =
				this.trades.filter((tr) => tr.success).reduce((sum, tr) => sum + tr.price, 0) / successfulTrades.length;
			return t.side === 'SELL' ? t.price > avgPrice : t.price < avgPrice;
		});

		const realizedPnl = strategyState.pnl;
		const unrealizedPnl = this.strategy.getUnrealizedPnL(yesPrice);
		const totalPnl = realizedPnl + unrealizedPnl;

		return {
			pnl: totalPnl,
			pnlPercent:
				Math.abs(strategyState.inventory) > 0
					? (totalPnl / (Math.abs(strategyState.inventory) * yesPrice)) * 100
					: 0,
			tradeCount: this.trades.length,
			winCount: wins.length,
			lossCount: successfulTrades.length - wins.length,
			winRate: successfulTrades.length > 0 ? wins.length / successfulTrades.length : 0,
			modelProbability: strategyState.theoreticalMid,
			modelProbabilityDelta: strategyState.theoreticalMid - strategyState.midPrice,
			marketPrice: yesPrice,
			yesPrice,
			noPrice,
			edge:
				strategyState.bidPrice && strategyState.askPrice
					? (strategyState.askPrice - strategyState.bidPrice) / 2
					: 0,
			edgeThreshold: this.config.edgeThreshold / 100,
			position: strategyState.inventory,
			exposure: Math.abs(strategyState.inventory) * yesPrice,
			eventCount: strategyState.fills,
		};
	}

	getStrategyState(): StrategyState {
		return this.strategy.getState();
	}

	getStrategyName(): string {
		return this.strategy.name;
	}

	getAvailableStrategies(): StrategyName[] {
		return getAvailableStrategies();
	}

	setStrategy(name: StrategyName): void {
		if (this.status !== 'IDLE' && this.status !== 'STOPPED') {
			throw new Error(`Cannot change strategy while bot is ${this.status}`);
		}
		this.strategy = createStrategy(name);
		console.log(`[BOT] Strategy changed to: ${name}`);
	}

	getEvents(): TradeEvent[] {
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
		this.strategy.updateConfig({
			orderSize: config.orderSize,
			maxInventory: config.maxPosition,
			minEdgeBps: config.edgeThreshold * 10,
		});
	}

	setStrategyConfig(config: Record<string, unknown>): void {
		this.strategy.updateConfig(config);
	}

	async start(marketTicker: string, dryRun = true): Promise<void> {
		if (this.status !== 'IDLE' && this.status !== 'STOPPED') {
			throw new Error(`Cannot start bot from ${this.status} state`);
		}

		this.setStatus('STARTING');
		this.marketTicker = marketTicker;
		this.dryRun = dryRun;
		this.error = null;

		this.events = [];
		this.trades = [];
		this.probabilityHistory = [];
		this.marketPrices = null;

		this.strategy.reset();
		this.strategy.updateConfig({
			orderSize: this.config.orderSize,
			maxInventory: this.config.maxPosition,
			minEdgeBps: this.config.edgeThreshold * 10,
		});

		try {
			initializeClient(dryRun);
			this.startTime = Date.now();
			this.setConnection('connected');
			this.setStatus('RUNNING');
			await this.startWebSocket(dryRun);
		} catch (err) {
			console.error('[BOT] Failed to start:', err);
			this.error = err instanceof Error ? err.message : 'Failed to start bot';
			this.setConnection('disconnected');
			this.setStatus('ERROR');
			this.emit('error', { message: this.error });
			throw err;
		}
	}

	private async startWebSocket(dryRun: boolean): Promise<void> {
		console.log('[BOT] Connecting to WebSocket...');
		await kalshiWs.connect(dryRun);
		console.log('[BOT] WebSocket connected');

		this.wsTickerHandler = (data: TickerUpdate) => {
			if (data.marketTicker !== this.marketTicker) return;
			this.handlePriceUpdate(data.yesAsk, data.noAsk);
		};

		kalshiWs.on('ticker', this.wsTickerHandler);
		kalshiWs.on('orderbook', (data: { marketTicker: string; yesAsk: number; noAsk: number }) => {
			console.log(`[BOT] Orderbook event received: ${data.marketTicker} YES=${data.yesAsk} NO=${data.noAsk}`);
			if (data.marketTicker !== this.marketTicker) return;
			console.log(`[BOT] Processing orderbook for ${data.marketTicker}`);
			this.handlePriceUpdate(data.yesAsk, data.noAsk);
		});
		kalshiWs.on('tickerCount', (count: number) => {
			this.emit('tickerCount', { count });
		});

		if (this.marketTicker) {
			kalshiWs.subscribeToMarket(this.marketTicker);
			console.log(`[BOT] Subscribed to ${this.marketTicker}`);

			if (dryRun) {
				this.startScenarioRunner(this.marketTicker);
			}
		}
	}

	private async startScenarioRunner(ticker: string): Promise<void> {
		console.log('[BOT] Starting ScenarioRunner for demo mode...');
		try {
			const result = await scenarioRunner.runScenario('spread-tighten', ticker);
			console.log('[BOT] ScenarioRunner result:', result.success ? 'success' : 'failed');
			if (!result.success) console.error('[BOT] Scenario steps:', result.steps);
		} catch (err) {
			console.error('[BOT] ScenarioRunner error:', err);
		}
	}

	private stopWebSocket(): void {
		if (this.wsTickerHandler) {
			kalshiWs.off('ticker', this.wsTickerHandler);
			this.wsTickerHandler = null;
		}
		if (this.marketTicker) {
			kalshiWs.unsubscribeFromMarket(this.marketTicker);
		}
		kalshiWs.disconnect();

		if (this.dryRun) {
			scenarioRunner.cancelAll().catch((err) => {
				console.error('[BOT] Failed to cancel scenario orders:', err);
			});
		}
	}

	private async handlePriceUpdate(yesPrice: number, noPrice: number): Promise<void> {
		console.log(`[BOT] handlePriceUpdate called: YES=${yesPrice} NO=${noPrice} status=${this.status}`);
		if (this.status !== 'RUNNING') return;

		this.marketPrices = { yesPrice, noPrice, timestamp: new Date() };
		this.emit('prices', { yesPrice, noPrice, timestamp: new Date().toISOString() });
		console.log(`[BOT] Emitted prices`);

		const signal = this.strategy.evaluateTrade(yesPrice, noPrice);
		const strategyState = this.strategy.getState();

		this.emit('quotes', {
			bid: strategyState.bidPrice,
			ask: strategyState.askPrice,
			mid: strategyState.theoreticalMid,
			inventory: strategyState.inventory,
		});

		this.probabilityHistory.push({
			posterior: strategyState.theoreticalMid,
			timestamp: new Date(),
		});
		this.emit('probability', { posterior: strategyState.theoreticalMid, timestamp: new Date() });

		if (signal) {
			const execution = await placeOrder(signal, this.marketTicker || '');

			if (execution.success) {
				this.strategy.onFill(signal.side, execution.price, signal.size);
			}

			this.trades.push(execution);
			this.emit('trade', { signal, execution });
		}
	}

	async stop(): Promise<void> {
		if (this.status !== 'RUNNING' && this.status !== 'PAUSED') {
			throw new Error(`Cannot stop bot from ${this.status} state`);
		}

		this.setStatus('STOPPING');
		this.stopWebSocket();

		await new Promise((resolve) => setTimeout(resolve, 500));

		this.setConnection('disconnected');
		this.startTime = null;
		this.setStatus('STOPPED');
	}

	private async closePosition(): Promise<void> {
		const strategyState = this.strategy.getState();
		const position = strategyState.inventory;

		if (position === 0) return;

		const prices = await fetchMarketPrices(this.marketTicker || '');
		if (!prices) return;

		const side = position > 0 ? 'SELL' : 'BUY';
		const size = Math.abs(position);
		const price = prices.yesPrice;

		console.log(`[FLATTEN] Closing ${size} contracts (${side}) @ ${(price * 100).toFixed(1)}¢`);

		const execution = await placeOrder({ side, price, size, edge: 0 }, this.marketTicker || '');
		if (!execution.success) return;

		this.strategy.onFill(side, execution.price, size);
		this.trades.push(execution);
		this.emit('trade', { signal: { side, price, size, edge: 0 }, execution });
	}

	async flattenAndStop(): Promise<void> {
		if (this.status !== 'RUNNING' && this.status !== 'PAUSED') {
			throw new Error(`Cannot flatten from ${this.status} state`);
		}

		this.setStatus('STOPPING');
		this.stopWebSocket();

		await this.closePosition();

		await new Promise((resolve) => setTimeout(resolve, 500));

		this.setConnection('disconnected');
		this.startTime = null;
		this.setStatus('STOPPED');
	}

	pause(): void {
		if (this.status !== 'RUNNING') {
			throw new Error(`Cannot pause bot from ${this.status} state`);
		}

		this.setStatus('PAUSED');
	}

	resume(): void {
		if (this.status !== 'PAUSED') {
			throw new Error(`Cannot resume bot from ${this.status} state`);
		}

		this.setStatus('RUNNING');
	}

	setDryRun(dryRun: boolean): void {
		this.dryRun = dryRun;
		this.emit('stateChange', this.getState());
	}

	reset(): void {
		this.stopWebSocket();
		this.status = 'IDLE';
		this.connection = 'disconnected';
		this.error = null;
		this.startTime = null;
		this.marketTicker = null;
		this.events = [];
		this.trades = [];
		this.probabilityHistory = [];
		this.marketPrices = null;
		this.strategy.reset();
		this.emit('stateChange', this.getState());
	}
}

export const tradingBot = new TradingBotService();
