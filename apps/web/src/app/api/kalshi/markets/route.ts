import { NextResponse } from 'next/server';

interface KalshiApiMarket {
	ticker: string;
	title: string;
	subtitle: string;
	status: string;
	yes_bid: number;
	yes_ask: number;
	no_bid: number;
	no_ask: number;
	volume: number;
	volume_24h: number;
	open_interest: number;
	category: string;
	close_time: string;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const status = searchParams.get('status') || 'open';
	const category = searchParams.get('category');
	const limit = searchParams.get('limit') || '50';
	const minVolume = parseInt(searchParams.get('minVolume') || '0', 10);
	const mode = searchParams.get('mode') || 'demo';

	const demoApiKeyId = process.env.KALSHI_DEMO_API_KEY_ID;
	const prodApiKeyId = process.env.KALSHI_API_KEY_ID;

	const useDemo = mode === 'demo';
	const apiKey = useDemo ? demoApiKeyId : prodApiKeyId;

	if (!apiKey) {
		return NextResponse.json(
			{ error: `Kalshi ${useDemo ? 'demo' : 'production'} API credentials not configured` },
			{ status: 500 }
		);
	}

	const baseUrl = useDemo
		? 'https://demo-api.kalshi.co/trade-api/v2'
		: 'https://api.elections.kalshi.com/trade-api/v2';

	try {
		const params = new URLSearchParams({
			status,
			limit: '200',
		});

		const response = await fetch(`${baseUrl}/markets?${params}`, {
			headers: {
				Accept: 'application/json',
			},
			cache: 'no-store',
		});

		if (!response.ok) {
			console.error('Kalshi API error:', response.status);
			return NextResponse.json({ error: `Kalshi API returned ${response.status}` }, { status: response.status });
		}

		const data = await response.json();
		let markets = (data.markets || []).map((m: KalshiApiMarket) => {
			const yesBid = (m.yes_bid || 0) / 100;
			const yesAsk = (m.yes_ask || 100) / 100;
			const spread = yesAsk - yesBid;
			return {
				ticker: m.ticker,
				title: m.title,
				subtitle: m.subtitle,
				status: m.status,
				yesBid,
				yesAsk,
				yesPrice: yesAsk,
				noPrice: (m.no_ask || 50) / 100,
				spread,
				spreadBps: Math.round(spread * 10000),
				volume: m.volume || 0,
				volume24h: m.volume_24h || 0,
				openInterest: m.open_interest || 0,
				category: m.category || 'other',
				expirationDate: m.close_time,
			};
		});

		if (category) {
			const categoryMap: Record<string, string[]> = {
				weather: ['weather', 'climate', 'temperature'],
				economics: ['economics', 'economy', 'fed', 'cpi', 'gdp', 'jobs', 'inflation'],
				sports: ['sports', 'nfl', 'nba', 'mlb', 'nhl', 'soccer', 'football', 'basketball'],
			};
			const keywords = categoryMap[category] || [];
			if (keywords.length > 0) {
				markets = markets.filter((m: { category: string; title: string; ticker: string }) => {
					const searchText = `${m.category} ${m.title} ${m.ticker}`.toLowerCase();
					return keywords.some((kw) => searchText.includes(kw));
				});
			}
		}

		if (minVolume > 0) {
			markets = markets.filter((m: { volume24h: number }) => m.volume24h >= minVolume);
		}

		markets = markets.slice(0, parseInt(limit, 10));

		return NextResponse.json({
			markets,
			source: useDemo ? 'demo' : 'production',
		});
	} catch (error) {
		console.error('Failed to fetch Kalshi markets:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch markets' },
			{ status: 500 }
		);
	}
}
