import { ClobClient, Side } from '@polymarket/clob-client';
import { Wallet } from 'ethers';
import type { TradeExecution, TradeSignal } from './types';

const POLY_HOST = 'https://clob.polymarket.com';
const CHAIN_ID = 137;

let clobClient: ClobClient | null = null;

export async function initializeClient(): Promise<ClobClient> {
	if (clobClient) {
		return clobClient;
	}

	const privateKey = process.env.POLY_PRIVATE_KEY;
	const funder = process.env.POLY_FUNDER_ADDRESS;

	if (!privateKey || !funder) {
		throw new Error('Missing POLY_PRIVATE_KEY or POLY_FUNDER_ADDRESS environment variables');
	}

	const signer = new Wallet(privateKey);
	const client = new ClobClient(POLY_HOST, CHAIN_ID, signer);
	const creds = await client.createOrDeriveApiKey();
	clobClient = new ClobClient(POLY_HOST, CHAIN_ID, signer, creds, 1, funder);

	return clobClient;
}

export async function fetchMarketPrices(marketId: string): Promise<{ yesPrice: number; noPrice: number } | null> {
	try {
		const response = await fetch(`https://gamma-api.polymarket.com/markets/${marketId}`);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const data = await response.json();
		const prices = data.outcomePrices;
		if (prices && prices.length >= 2) {
			return {
				yesPrice: Number.parseFloat(prices[0]),
				noPrice: Number.parseFloat(prices[1]),
			};
		}
		return null;
	} catch (error) {
		console.error('Failed to fetch market prices:', error);
		return null;
	}
}

export async function placeOrder(signal: TradeSignal, isDryRun: boolean): Promise<TradeExecution> {
	const execution: TradeExecution = {
		id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		side: signal.side,
		price: signal.price,
		size: signal.size,
		timestamp: new Date(),
		simulated: isDryRun,
		success: false,
	};

	if (isDryRun) {
		console.log(`[DRY RUN] Would place ${signal.side} order: ${signal.size} @ ${signal.price}`);
		execution.success = true;
		return execution;
	}

	try {
		const client = await initializeClient();
		const tokenId =
			signal.side === 'BUY' ? (process.env.POLY_YES_TOKEN_ID ?? '') : (process.env.POLY_NO_TOKEN_ID ?? '');

		const order = await client.createOrder({
			tokenID: tokenId,
			price: signal.price,
			side: signal.side === 'BUY' ? Side.BUY : Side.SELL,
			size: signal.size,
		});

		const response = await client.postOrder(order);
		console.log('Order placed:', response);
		execution.success = true;
	} catch (error) {
		console.error('Failed to place order:', error);
		execution.error = error instanceof Error ? error.message : 'Unknown error';
	}

	return execution;
}

export function getClient(): ClobClient | null {
	return clobClient;
}
