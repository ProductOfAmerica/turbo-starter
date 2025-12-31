import { NextResponse } from 'next/server';
import { tradingBot } from '@/services/trading-bot';

export async function POST(request: Request) {
	try {
		const { dryRun } = await request.json();
		tradingBot.setDryRun(dryRun);
		return NextResponse.json({
			success: true,
			state: tradingBot.getState(),
		});
	} catch (err) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Failed to set dry run' },
			{ status: 400 }
		);
	}
}
