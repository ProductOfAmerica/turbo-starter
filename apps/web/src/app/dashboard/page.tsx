import { Suspense } from 'react';
import { tradingBot } from '@/services/trading-bot';
import { DashboardClient } from './dashboard-client';
import DashboardLoading from './loading';

async function getInitialData() {
	try {
		const state = tradingBot.getState();
		const config = tradingBot.getConfig();
		return { state, config };
	} catch {
		return { state: null, config: null };
	}
}

export default async function DashboardPage() {
	const { state, config } = await getInitialData();

	return (
		<Suspense fallback={<DashboardLoading />}>
			<DashboardClient initialBotState={state} initialConfig={config} />
		</Suspense>
	);
}
