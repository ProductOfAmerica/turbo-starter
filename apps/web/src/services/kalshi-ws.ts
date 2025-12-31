import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import WebSocket from 'ws';

const KALSHI_WS_PROD = 'wss://api.elections.kalshi.com/trade-api/ws/v2';
const KALSHI_WS_DEMO = 'wss://demo-api.kalshi.co/trade-api/ws/v2';

function loadPrivateKey(path: string): string {
	try {
		return fs.readFileSync(path, 'utf-8');
	} catch (err) {
		console.error(`[WS] Failed to read private key from ${path}:`, err);
		throw new Error(`Failed to read private key from ${path}`);
	}
}

function getCredentials(dryRun: boolean): { apiKeyId: string; privateKey: string; wsUrl: string } {
	if (dryRun) {
		const apiKeyId = process.env.KALSHI_DEMO_API_KEY_ID;
		const privateKeyPath = process.env.KALSHI_DEMO_PRIVATE_KEY_PATH;
		if (!apiKeyId || !privateKeyPath) {
			throw new Error(
				'Demo credentials not configured: KALSHI_DEMO_API_KEY_ID and KALSHI_DEMO_PRIVATE_KEY_PATH required'
			);
		}
		return { apiKeyId, privateKey: loadPrivateKey(privateKeyPath), wsUrl: KALSHI_WS_DEMO };
	} else {
		const apiKeyId = process.env.KALSHI_API_KEY_ID;
		const privateKeyPath = process.env.KALSHI_PRIVATE_KEY_PATH;
		if (!apiKeyId || !privateKeyPath) {
			throw new Error(
				'Production credentials not configured: KALSHI_API_KEY_ID and KALSHI_PRIVATE_KEY_PATH required'
			);
		}
		return { apiKeyId, privateKey: loadPrivateKey(privateKeyPath), wsUrl: KALSHI_WS_PROD };
	}
}

export interface TickerUpdate {
	marketTicker: string;
	yesBid: number;
	yesAsk: number;
	noBid: number;
	noAsk: number;
	lastPrice: number;
	volume: number;
}

export interface KalshiWsEvents {
	ticker: (data: TickerUpdate) => void;
	connected: () => void;
	disconnected: () => void;
	error: (error: Error) => void;
}

class KalshiWebSocketService extends EventEmitter {
	private ws: WebSocket | null = null;
	private apiKeyId: string = '';
	private privateKey: string = '';
	private wsUrl: string = '';
	private currentDryRun: boolean = true;
	private reconnectAttempts = 0;
	private maxReconnectAttempts = 5;
	private reconnectDelay = 1000;
	private subscribedMarkets: Set<string> = new Set();
	private messageId = 0;
	private connected = false;
	private pingInterval: NodeJS.Timeout | null = null;
	private shouldReconnect = true;
	private orderbooks: Map<string, { yesBids: Map<number, number>; noBids: Map<number, number> }> = new Map();
	private tickerCount = 0;

	private signMessage(timestamp: string): string {
		const message = `${timestamp}GET/trade-api/ws/v2`;
		const signature = crypto.sign('sha256', Buffer.from(message), {
			key: this.privateKey,
			padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
			saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
		});
		return signature.toString('base64');
	}

	async connect(dryRun: boolean = true): Promise<void> {
		if (this.connected && this.currentDryRun === dryRun) {
			console.log('[WS] Already connected');
			return;
		}

		if (this.connected) {
			this.disconnect();
		}

		const creds = getCredentials(dryRun);
		this.apiKeyId = creds.apiKeyId;
		this.privateKey = creds.privateKey;
		this.wsUrl = creds.wsUrl;
		this.currentDryRun = dryRun;

		this.shouldReconnect = true;
		const timestamp = String(Date.now());
		const signature = this.signMessage(timestamp);

		console.log(`[WS] Connecting to ${this.wsUrl} (${dryRun ? 'DEMO' : 'PRODUCTION'})`);

		return new Promise((resolve, reject) => {
			this.ws = new WebSocket(this.wsUrl, {
				headers: {
					'KALSHI-ACCESS-KEY': this.apiKeyId,
					'KALSHI-ACCESS-SIGNATURE': signature,
					'KALSHI-ACCESS-TIMESTAMP': timestamp.toString(),
				},
			});

			this.ws.on('open', () => {
				this.handleOpen();
				resolve();
			});

			this.ws.on('message', (data: Buffer) => this.handleIncomingMessage(data));

			this.ws.on('close', (code: number, reason: Buffer) => this.handleClose(code, reason));

			this.ws.on('error', (err: Error) => {
				this.handleError(err);
				if (!this.connected) reject(err);
			});
		});
	}

	private handleOpen(): void {
		console.log(`[WS] Connected to Kalshi (${this.currentDryRun ? 'DEMO' : 'PRODUCTION'})`);
		this.connected = true;
		this.reconnectAttempts = 0;
		this.startPingInterval();
		this.resubscribeAll();
		this.emit('connected');
	}

	private handleIncomingMessage(data: Buffer): void {
		try {
			const message = JSON.parse(data.toString());
			this.handleMessage(message);
		} catch (err) {
			console.error('[WS] Failed to parse message:', err);
		}
	}

	private handleClose(code: number, reason: Buffer): void {
		console.log(`[WS] Disconnected: ${code} - ${reason.toString()}`);
		this.connected = false;
		this.stopPingInterval();
		this.emit('disconnected');
		if (this.shouldReconnect) this.attemptReconnect();
	}

	private handleError(err: Error): void {
		console.error('[WS] Error:', err);
		this.emit('error', err);
	}

	private resubscribeAll(): void {
		for (const ticker of this.subscribedMarkets) {
			this.sendSubscription(ticker);
		}
	}

	private startPingInterval(): void {
		this.stopPingInterval();
		this.pingInterval = setInterval(() => {
			if (this.ws && this.connected) {
				this.ws.ping();
			}
		}, 30000);
	}

	private stopPingInterval(): void {
		if (this.pingInterval) {
			clearInterval(this.pingInterval);
			this.pingInterval = null;
		}
	}

	private attemptReconnect(): void {
		if (!this.shouldReconnect) return;

		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error('[WS] Max reconnect attempts reached');
			this.emit('error', new Error('Max reconnect attempts reached'));
			return;
		}

		this.reconnectAttempts++;
		const delay = this.reconnectDelay * 2 ** (this.reconnectAttempts - 1);
		console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

		setTimeout(() => {
			if (this.shouldReconnect) {
				this.connect(this.currentDryRun).catch((err) => {
					console.error('[WS] Reconnect failed:', err);
				});
			}
		}, delay);
	}

	private handleMessage(message: { type?: string; sid?: number; msg?: Record<string, unknown> }): void {
		const { type, msg } = message;

		if (type !== 'ticker') {
			console.log('[WS] Message:', JSON.stringify(message).slice(0, 200));
		}

		if (type === 'ticker' && msg) {
			this.tickerCount++;
			const yesBid = typeof msg.yes_bid === 'number' ? msg.yes_bid / 100 : 0;
			const yesAsk = typeof msg.yes_ask === 'number' ? msg.yes_ask / 100 : 0;
			const noBid = typeof msg.no_bid === 'number' ? msg.no_bid / 100 : 0;
			const noAsk = typeof msg.no_ask === 'number' ? msg.no_ask / 100 : 0;

			if (yesAsk === 0 && noAsk === 0) {
				this.emit('tickerCount', this.tickerCount);
				return;
			}

			const ticker: TickerUpdate = {
				marketTicker: msg.market_ticker as string,
				yesBid,
				yesAsk,
				noBid,
				noAsk,
				lastPrice: typeof msg.last_price === 'number' ? msg.last_price / 100 : 0,
				volume: typeof msg.volume === 'number' ? msg.volume : 0,
			};
			this.emit('ticker', ticker);
			this.emit('tickerCount', this.tickerCount);
		}

		if (type === 'orderbook_snapshot' && msg) {
			const marketTicker = msg.market_ticker as string;
			const yesBidsArr = (msg.yes as number[][]) || [];
			const noBidsArr = (msg.no as number[][]) || [];

			const yesBids = this.parseOrderbookEntries(yesBidsArr);
			const noBids = this.parseOrderbookEntries(noBidsArr);
			this.orderbooks.set(marketTicker, { yesBids, noBids });
			this.emitOrderbookUpdate(marketTicker);
		}

		if (type === 'orderbook_delta' && msg) {
			const marketTicker = msg.market_ticker as string;
			const price = msg.price as number;
			const delta = msg.delta as number;
			const side = msg.side as 'yes' | 'no';

			let book = this.orderbooks.get(marketTicker);
			if (!book) {
				book = { yesBids: new Map(), noBids: new Map() };
				this.orderbooks.set(marketTicker, book);
			}

			const bids = side === 'yes' ? book.yesBids : book.noBids;
			const currentQty = bids.get(price) || 0;
			const newQty = currentQty + delta;

			if (newQty <= 0) {
				bids.delete(price);
			} else {
				bids.set(price, newQty);
			}

			this.emitOrderbookUpdate(marketTicker);
		}
	}

	private parseOrderbookEntries(entries: number[][]): Map<number, number> {
		const result = new Map<number, number>();
		for (const [price, qty] of entries) {
			if (price !== undefined && qty !== undefined) result.set(price, qty);
		}
		return result;
	}

	private emitOrderbookUpdate(marketTicker: string): void {
		const book = this.orderbooks.get(marketTicker);
		if (!book) return;

		const yesBidPrices = Array.from(book.yesBids.keys()).filter((p) => (book.yesBids.get(p) || 0) > 0);
		const noBidPrices = Array.from(book.noBids.keys()).filter((p) => (book.noBids.get(p) || 0) > 0);

		const bestYesBid = yesBidPrices.length > 0 ? Math.max(...yesBidPrices) : 0;
		const bestNoBid = noBidPrices.length > 0 ? Math.max(...noBidPrices) : 0;

		const yesAsk = bestNoBid > 0 ? 100 - bestNoBid : 0;
		const noAsk = bestYesBid > 0 ? 100 - bestYesBid : 0;

		console.log(
			`[WS] Orderbook update: YES bid=${bestYesBid} NO bid=${bestNoBid} -> YES ask=${yesAsk}¢ NO ask=${noAsk}¢`
		);

		this.emit('orderbook', {
			marketTicker,
			yesAsk: yesAsk / 100,
			noAsk: noAsk / 100,
		});
	}

	private sendSubscription(ticker: string): void {
		if (!this.ws || !this.connected) return;

		const tickerMsg = {
			id: ++this.messageId,
			cmd: 'subscribe',
			params: {
				channels: ['ticker'],
			},
		};
		this.ws.send(JSON.stringify(tickerMsg));

		const orderbookMsg = {
			id: ++this.messageId,
			cmd: 'subscribe',
			params: {
				channels: ['orderbook_delta'],
				market_tickers: [ticker],
			},
		};
		this.ws.send(JSON.stringify(orderbookMsg));

		console.log(`[WS] Subscribing to ticker + orderbook for ${ticker}`);
	}

	subscribeToMarket(ticker: string): void {
		this.subscribedMarkets.add(ticker);
		if (this.connected) {
			this.sendSubscription(ticker);
		}
	}

	unsubscribeFromMarket(ticker: string): void {
		this.subscribedMarkets.delete(ticker);

		if (!this.ws || !this.connected) return;

		const unsubscribeMsg = {
			id: ++this.messageId,
			cmd: 'unsubscribe',
			params: {
				channels: ['ticker'],
				market_tickers: [ticker],
			},
		};

		console.log(`[WS] Unsubscribing from ${ticker}`);
		this.ws.send(JSON.stringify(unsubscribeMsg));
	}

	disconnect(): void {
		console.log('[WS] Disconnecting...');
		this.shouldReconnect = false;
		this.stopPingInterval();
		this.subscribedMarkets.clear();

		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}

		this.connected = false;
	}

	isConnected(): boolean {
		return this.connected;
	}

	isDemoMode(): boolean {
		return this.currentDryRun;
	}

	getTickerCount(): number {
		return this.tickerCount;
	}

	resetTickerCount(): void {
		this.tickerCount = 0;
	}
}

export const kalshiWs = new KalshiWebSocketService();
