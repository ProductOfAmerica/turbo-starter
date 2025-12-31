import { NextResponse } from 'next/server';
import { tradingBot } from '@/services/trading-bot';

interface StartRequest {
	marketTicker: string;
	dryRun?: boolean;
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as StartRequest;
		const { marketTicker, dryRun = true } = body;

		if (!marketTicker) {
			return NextResponse.json({ error: 'Missing marketTicker' }, { status: 400 });
		}

		await tradingBot.start(marketTicker, dryRun);

		return NextResponse.json({
			success: true,
			state: tradingBot.getState(),
		});
	} catch (err) {
		return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to start bot' }, { status: 400 });
	}
}
