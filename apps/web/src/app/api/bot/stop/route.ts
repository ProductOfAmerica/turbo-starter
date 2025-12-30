import { NextResponse } from 'next/server';
import { tradingBot } from '@/services/trading-bot';

export async function POST() {
	try {
		await tradingBot.stop();

		return NextResponse.json({
			success: true,
			state: tradingBot.getState(),
		});
	} catch (err) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Failed to stop bot' },
			{ status: 400 }
		);
	}
}
