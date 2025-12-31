import { NextResponse } from 'next/server';
import { scenarioRunner } from '@/services/scenario-runner';

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as { scenario?: string; ticker?: string };
		const { scenario, ticker } = body;

		if (!scenario || !ticker) {
			return NextResponse.json({ error: 'Missing required fields: scenario, ticker' }, { status: 400 });
		}

		const availableScenarios = scenarioRunner.getAvailableScenarios();
		if (!availableScenarios.includes(scenario)) {
			return NextResponse.json(
				{
					error: `Unknown scenario: ${scenario}`,
					available: availableScenarios,
				},
				{ status: 400 }
			);
		}

		const result = await scenarioRunner.runScenario(scenario, ticker);
		return NextResponse.json(result);
	} catch (err) {
		console.error('[API] Scenario error:', err);
		const message = err instanceof Error ? err.message : 'Internal server error';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

export async function GET() {
	return NextResponse.json({
		scenarios: scenarioRunner.getAvailableScenarios(),
		activeOrders: scenarioRunner.getActiveOrders(),
	});
}

export async function DELETE() {
	try {
		await scenarioRunner.cancelAll();
		return NextResponse.json({ success: true, message: 'All scenario orders cancelled' });
	} catch (err) {
		console.error('[API] Cancel all error:', err);
		const message = err instanceof Error ? err.message : 'Internal server error';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
