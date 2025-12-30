import { fetchMarketPrices } from '@/services/polymarket';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const marketId = searchParams.get('marketId') || process.env.POLYMARKET_ID;

	if (!marketId) {
		return NextResponse.json({ error: 'Missing marketId parameter' }, { status: 400 });
	}

	const prices = await fetchMarketPrices(marketId);

	if (!prices) {
		return NextResponse.json({ error: 'Failed to fetch market prices' }, { status: 500 });
	}

	return NextResponse.json({
		...prices,
		timestamp: new Date().toISOString(),
	});
}
