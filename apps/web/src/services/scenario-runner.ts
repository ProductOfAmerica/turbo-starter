import { Configuration, OrdersApi } from 'kalshi-typescript';

const KALSHI_DEMO_BASE = 'https://demo-api.kalshi.co/trade-api/v2';

export interface ScenarioConfig {
	yesBid?: number;
	yesAsk?: number;
	size?: number;
}

export interface ScenarioStep {
	action: 'setup' | 'move' | 'spike' | 'wait' | 'cancel';
	config?: ScenarioConfig;
	delayMs?: number;
}

export interface ScenarioResult {
	success: boolean;
	scenario: string;
	ticker: string;
	steps: { step: string; orderId?: string; error?: string }[];
	activeOrders: string[];
}

type ScenarioDefinition = ScenarioStep[];

const SCENARIOS: Record<string, ScenarioDefinition> = {
	'spread-tighten': [
		{ action: 'setup', config: { yesBid: 45, yesAsk: 55, size: 10 } },
		{ action: 'wait', delayMs: 3000 },
		{ action: 'move', config: { yesBid: 48, yesAsk: 52, size: 10 } },
	],
	'price-spike': [
		{ action: 'setup', config: { yesBid: 48, yesAsk: 52, size: 10 } },
		{ action: 'wait', delayMs: 2000 },
		{ action: 'spike', config: { yesAsk: 65, size: 5 } },
		{ action: 'wait', delayMs: 2000 },
		{ action: 'move', config: { yesBid: 48, yesAsk: 52, size: 10 } },
	],
	'fill-test': [{ action: 'setup', config: { yesAsk: 50, size: 10 } }],
	'boundary-test': [{ action: 'setup', config: { yesBid: 5, yesAsk: 95, size: 10 } }],
};

class ScenarioRunnerService {
	private ordersApi: OrdersApi | null = null;
	private activeOrders: Set<string> = new Set();
	private initialized = false;

	init(): void {
		if (this.initialized) return;

		const apiKeyId = process.env.KALSHI_DEMO_API_KEY_ID;
		const privateKeyPath = process.env.KALSHI_DEMO_PRIVATE_KEY_PATH;

		if (!apiKeyId || !privateKeyPath) {
			throw new Error(
				'Demo credentials not configured: KALSHI_DEMO_API_KEY_ID and KALSHI_DEMO_PRIVATE_KEY_PATH required'
			);
		}

		const config = new Configuration({
			apiKey: apiKeyId,
			privateKeyPath,
			basePath: KALSHI_DEMO_BASE,
		});

		this.ordersApi = new OrdersApi(config);
		this.initialized = true;
		console.log('[ScenarioRunner] Initialized with demo credentials');
	}

	async setup(ticker: string, config: ScenarioConfig): Promise<string[]> {
		if (!this.ordersApi) {
			throw new Error('ScenarioRunner not initialized');
		}

		const orderIds: string[] = [];
		const size = config.size ?? 10;

		if (config.yesBid !== undefined) {
			const response = await this.ordersApi.createOrder({
				ticker,
				side: 'yes',
				action: 'buy',
				type: 'limit',
				count: size,
				yes_price: config.yesBid,
				client_order_id: `scenario-bid-${Date.now()}`,
			});
			const orderId = response.data.order?.order_id;
			if (orderId) {
				orderIds.push(orderId);
				this.activeOrders.add(orderId);
				console.log(`[ScenarioRunner] Posted YES bid @ ${config.yesBid}¢, order ${orderId}`);
			}
		}

		if (config.yesAsk !== undefined) {
			const response = await this.ordersApi.createOrder({
				ticker,
				side: 'yes',
				action: 'sell',
				type: 'limit',
				count: size,
				yes_price: config.yesAsk,
				client_order_id: `scenario-ask-${Date.now()}`,
			});
			const orderId = response.data.order?.order_id;
			if (orderId) {
				orderIds.push(orderId);
				this.activeOrders.add(orderId);
				console.log(`[ScenarioRunner] Posted YES ask @ ${config.yesAsk}¢, order ${orderId}`);
			}
		}

		return orderIds;
	}

	async movePrices(ticker: string, config: ScenarioConfig): Promise<string[]> {
		await this.cancelAll();
		return this.setup(ticker, config);
	}

	async spike(ticker: string, config: ScenarioConfig): Promise<string[]> {
		if (!this.ordersApi) {
			throw new Error('ScenarioRunner not initialized');
		}

		const orderIds: string[] = [];
		const size = config.size ?? 5;

		if (config.yesAsk !== undefined) {
			const response = await this.ordersApi.createOrder({
				ticker,
				side: 'yes',
				action: 'sell',
				type: 'limit',
				count: size,
				yes_price: config.yesAsk,
				client_order_id: `scenario-spike-${Date.now()}`,
			});
			const orderId = response.data.order?.order_id;
			if (orderId) {
				orderIds.push(orderId);
				this.activeOrders.add(orderId);
				console.log(`[ScenarioRunner] Spike: Posted YES ask @ ${config.yesAsk}¢, order ${orderId}`);
			}
		}

		if (config.yesBid !== undefined) {
			const response = await this.ordersApi.createOrder({
				ticker,
				side: 'yes',
				action: 'buy',
				type: 'limit',
				count: size,
				yes_price: config.yesBid,
				client_order_id: `scenario-spike-${Date.now()}`,
			});
			const orderId = response.data.order?.order_id;
			if (orderId) {
				orderIds.push(orderId);
				this.activeOrders.add(orderId);
				console.log(`[ScenarioRunner] Spike: Posted YES bid @ ${config.yesBid}¢, order ${orderId}`);
			}
		}

		return orderIds;
	}

	async cancelAll(): Promise<void> {
		if (!this.ordersApi) {
			throw new Error('ScenarioRunner not initialized');
		}

		const orderIds = Array.from(this.activeOrders);
		if (orderIds.length === 0) return;

		const batches: string[][] = [];
		for (let i = 0; i < orderIds.length; i += 20) {
			batches.push(orderIds.slice(i, i + 20));
		}

		for (const batch of batches) {
			try {
				await this.ordersApi.batchCancelOrders({ ids: batch });
				console.log(`[ScenarioRunner] Cancelled ${batch.length} orders`);
			} catch (err) {
				console.error('[ScenarioRunner] Failed to cancel batch:', err);
			}
		}

		this.activeOrders.clear();
	}

	private async executeStep(
		step: ScenarioStep,
		ticker: string
	): Promise<{ step: string; orderId?: string }> {
		switch (step.action) {
			case 'setup': {
				if (!step.config) return { step: 'setup' };
				const ids = await this.setup(ticker, step.config);
				return { step: 'setup', orderId: ids.join(',') };
			}
			case 'move': {
				if (!step.config) return { step: 'move' };
				const ids = await this.movePrices(ticker, step.config);
				return { step: 'move', orderId: ids.join(',') };
			}
			case 'spike': {
				if (!step.config) return { step: 'spike' };
				const ids = await this.spike(ticker, step.config);
				return { step: 'spike', orderId: ids.join(',') };
			}
			case 'wait': {
				if (!step.delayMs) return { step: 'wait 0ms' };
				await new Promise((resolve) => setTimeout(resolve, step.delayMs));
				return { step: `wait ${step.delayMs}ms` };
			}
			case 'cancel': {
				await this.cancelAll();
				return { step: 'cancel' };
			}
		}
	}

	async runScenario(name: string, ticker: string): Promise<ScenarioResult> {
		const definition = SCENARIOS[name];
		if (!definition) {
			return {
				success: false,
				scenario: name,
				ticker,
				steps: [{ step: 'init', error: `Unknown scenario: ${name}` }],
				activeOrders: [],
			};
		}

		this.init();
		const result: ScenarioResult = {
			success: true,
			scenario: name,
			ticker,
			steps: [],
			activeOrders: [],
		};

		try {
			for (const step of definition) {
				const stepResult = await this.executeStep(step, ticker);
				result.steps.push(stepResult);
			}
		} catch (err) {
			result.success = false;
			const message = err instanceof Error ? err.message : 'Unknown error';
			result.steps.push({ step: 'error', error: message });
		}

		result.activeOrders = Array.from(this.activeOrders);
		return result;
	}

	getActiveOrders(): string[] {
		return Array.from(this.activeOrders);
	}

	getAvailableScenarios(): string[] {
		return Object.keys(SCENARIOS);
	}
}

export const scenarioRunner = new ScenarioRunnerService();
