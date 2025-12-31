import { NextResponse } from 'next/server';
import { getAvailableStrategies, type StrategyName } from '@/services/strategies';
import { tradingBot } from '@/services/trading-bot';

export async function GET() {
	return NextResponse.json({
		current: tradingBot.getStrategyName(),
		available: getAvailableStrategies(),
	});
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as { strategy?: string };
		const { strategy } = body;

		if (!strategy) {
			return NextResponse.json({ error: 'Missing strategy name' }, { status: 400 });
		}

		const available = getAvailableStrategies();
		if (!available.includes(strategy as StrategyName)) {
			return NextResponse.json(
				{
					error: `Unknown strategy: ${strategy}`,
					available,
				},
				{ status: 400 }
			);
		}

		tradingBot.setStrategy(strategy as StrategyName);

		return NextResponse.json({
			success: true,
			strategy: tradingBot.getStrategyName(),
		});
	} catch (err) {
		console.error('[API] Strategy error:', err);
		const message = err instanceof Error ? err.message : 'Internal server error';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
