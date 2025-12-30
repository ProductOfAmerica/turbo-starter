import { NextResponse } from 'next/server';
import { tradingBot } from '@/services/trading-bot';
import type { GameType } from '@/services/types';

export const dynamic = 'force-dynamic';

interface StartRequest {
	gameType: GameType;
	matchId: string;
	marketId?: string;
	dryRun?: boolean;
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as StartRequest;
		const { gameType, matchId, marketId, dryRun = true } = body;

		if (!gameType || !matchId) {
			return NextResponse.json({ error: 'Missing gameType or matchId' }, { status: 400 });
		}

		if (gameType !== 'lol' && gameType !== 'dota') {
			return NextResponse.json({ error: 'Invalid gameType' }, { status: 400 });
		}

		await tradingBot.start(gameType, matchId, marketId, dryRun);

		return NextResponse.json({
			success: true,
			state: tradingBot.getState(),
		});
	} catch (err) {
		return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to start bot' }, { status: 400 });
	}
}
