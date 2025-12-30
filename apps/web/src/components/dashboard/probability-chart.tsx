'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@repo/ui/components/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import type { ProbabilityUpdate } from '@/services/types';

interface ProbabilityChartProps {
	history: ProbabilityUpdate[];
	marketPrice?: number;
}

const chartConfig = {
	posterior: {
		label: 'Model Probability',
		color: '#2563eb',
	},
} satisfies ChartConfig;

export function ProbabilityChart({ history, marketPrice }: ProbabilityChartProps) {
	const data = history.map((h, i) => ({
		index: i,
		posterior: h.posterior * 100,
		time: new Date(h.timestamp).toLocaleTimeString(),
		event: h.eventType || null,
	}));

	return (
		<Card>
			<CardHeader>
				<CardTitle>Win Probability Timeline</CardTitle>
				<CardDescription>Bayesian posterior updates over time</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[300px] w-full">
					<LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="time"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value: string) => value}
							interval="preserveStartEnd"
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							domain={[0, 100]}
							tickFormatter={(value: number) => `${value}%`}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(_, payload) => {
										const item = payload?.[0]?.payload;
										return item?.event ? `${item.time} - ${item.event}` : item?.time;
									}}
								/>
							}
						/>
						{marketPrice !== undefined && (
							<ReferenceLine
								y={marketPrice * 100}
								stroke="#f97316"
								strokeDasharray="5 5"
								label={{ value: 'Market', position: 'right', fill: '#f97316' }}
							/>
						)}
						<Line
							type="stepAfter"
							dataKey="posterior"
							stroke="var(--color-posterior)"
							strokeWidth={2}
							dot={false}
							activeDot={{ r: 4 }}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
