import { NextResponse } from 'next/server';
import { tradingBot } from '@/services/trading-bot';

export async function POST() {
	try {
		tradingBot.pause();

		return NextResponse.json({
			success: true,
			state: tradingBot.getState(),
		});
	} catch (err) {
		return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to pause bot' }, { status: 400 });
	}
}
