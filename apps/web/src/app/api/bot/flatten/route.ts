import { NextResponse } from 'next/server';
import { tradingBot } from '@/services/trading-bot';

export async function POST() {
	try {
		await tradingBot.flattenAndStop();

		return NextResponse.json({
			success: true,
			state: tradingBot.getState(),
		});
	} catch (err) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Failed to flatten and stop' },
			{ status: 400 }
		);
	}
}
