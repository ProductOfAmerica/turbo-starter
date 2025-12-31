import { NextResponse } from 'next/server';
import { tradingBot } from '@/services/trading-bot';

export async function GET() {
	return NextResponse.json({
		state: tradingBot.getState(),
		stats: tradingBot.getStats(),
		config: tradingBot.getConfig(),
	});
}
