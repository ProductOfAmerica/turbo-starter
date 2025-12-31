import { Configuration, MarketApi, OrdersApi, PortfolioApi } from 'kalshi-typescript';
import type { TradeExecution, TradeSignal } from './types';

const KALSHI_PROD_BASE = 'https://api.elections.kalshi.com/trade-api/v2';
const KALSHI_DEMO_BASE = 'https://demo-api.kalshi.co/trade-api/v2';

let marketApi: MarketApi | null = null;
let ordersApi: OrdersApi | null = null;
let portfolioApi: PortfolioApi | null = null;
let initialized = false;
let currentDryRun = true;

function getCredentials(dryRun: boolean): { apiKeyId: string; privateKeyPath: string; basePath: string } {
	if (dryRun) {
		const apiKeyId = process.env.KALSHI_DEMO_API_KEY_ID;
		const privateKeyPath = process.env.KALSHI_DEMO_PRIVATE_KEY_PATH;
		if (!apiKeyId || !privateKeyPath) {
			throw new Error(
				'Demo credentials not configured: KALSHI_DEMO_API_KEY_ID and KALSHI_DEMO_PRIVATE_KEY_PATH required'
			);
		}
		return { apiKeyId, privateKeyPath, basePath: KALSHI_DEMO_BASE };
	} else {
		const apiKeyId = process.env.KALSHI_API_KEY_ID;
		const privateKeyPath = process.env.KALSHI_PRIVATE_KEY_PATH;
		if (!apiKeyId || !privateKeyPath) {
			throw new Error(
				'Production credentials not configured: KALSHI_API_KEY_ID and KALSHI_PRIVATE_KEY_PATH required'
			);
		}
		return { apiKeyId, privateKeyPath, basePath: KALSHI_PROD_BASE };
	}
}

export function initializeClient(dryRun: boolean = true): void {
	if (initialized && currentDryRun === dryRun) return;

	const { apiKeyId, privateKeyPath, basePath } = getCredentials(dryRun);

	const config = new Configuration({
		apiKey: apiKeyId,
		privateKeyPath,
		basePath,
	});

	marketApi = new MarketApi(config);
	ordersApi = new OrdersApi(config);
	portfolioApi = new PortfolioApi(config);
	initialized = true;
	currentDryRun = dryRun;

	console.log(`Kalshi SDK initialized (${dryRun ? 'DEMO' : 'PRODUCTION'} mode)`);
}

export function isDemoMode(): boolean {
	return currentDryRun;
}

export async function getMarkets(status: 'open' | 'closed' | 'settled' = 'open') {
	if (!marketApi) {
		throw new Error('Kalshi client not initialized');
	}

	const response = await marketApi.getMarkets(
		100,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		undefined,
		status
	);
	return response.data.markets || [];
}

export async function getMarket(ticker: string) {
	if (!marketApi) {
		throw new Error('Kalshi client not initialized');
	}

	const response = await marketApi.getMarket(ticker);
	return response.data.market;
}

export async function fetchMarketPrices(ticker: string): Promise<{ yesPrice: number; noPrice: number } | null> {
	if (!marketApi) {
		throw new Error('Kalshi client not initialized');
	}

	try {
		const response = await marketApi.getMarket(ticker);
		const market = response.data.market;
		if (!market) return null;

		return {
			yesPrice: (market.yes_ask || 50) / 100,
			noPrice: (market.no_ask || 50) / 100,
		};
	} catch (error) {
		console.error('Failed to fetch Kalshi market prices:', error);
		return null;
	}
}

export async function placeOrder(signal: TradeSignal, ticker: string): Promise<TradeExecution> {
	if (!ordersApi) {
		throw new Error('Kalshi client not initialized');
	}

	const execution: TradeExecution = {
		id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		side: signal.side,
		price: signal.price,
		size: signal.size,
		timestamp: new Date(),
		simulated: currentDryRun,
		success: false,
	};

	try {
		const priceInCents = Math.max(1, Math.min(99, Math.round(signal.price * 100)));

		const orderRequest: {
			ticker: string;
			action: 'buy' | 'sell';
			side: 'yes' | 'no';
			type: 'limit';
			count: number;
			yes_price?: number;
			no_price?: number;
			client_order_id: string;
		} = {
			ticker,
			action: signal.side === 'BUY' ? 'buy' : 'sell',
			side: 'yes',
			type: 'limit',
			count: signal.size,
			client_order_id: `bot-${Date.now()}`,
		};

		if (signal.side === 'BUY') {
			orderRequest.yes_price = priceInCents;
		} else {
			orderRequest.yes_price = priceInCents;
		}

		const response = await ordersApi.createOrder(orderRequest);

		const order = response.data.order;
		execution.id = order?.order_id || execution.id;
		execution.success = true;
		console.log(`[${currentDryRun ? 'DEMO' : 'LIVE'}] Order placed:`, order);
	} catch (error) {
		console.error('Failed to place Kalshi order:', error);
		if (error && typeof error === 'object' && 'response' in error) {
			const axiosError = error as { response?: { data?: unknown } };
			console.error('Kalshi API response:', JSON.stringify(axiosError.response?.data, null, 2));
		}
		execution.error = error instanceof Error ? error.message : 'Unknown error';
	}

	return execution;
}

export async function getBalance(): Promise<number | null> {
	if (!portfolioApi) {
		throw new Error('Kalshi client not initialized');
	}

	try {
		const response = await portfolioApi.getBalance();
		return (response.data.balance || 0) / 100;
	} catch (error) {
		console.error('Failed to fetch balance:', error);
		return null;
	}
}

export function isInitialized(): boolean {
	return initialized;
}
