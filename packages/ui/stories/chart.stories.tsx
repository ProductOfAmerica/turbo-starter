import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@repo/ui/components/chart';
import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { expect } from 'storybook/test';

const visitors = [
	{ month: 'January', desktop: 186, mobile: 80 },
	{ month: 'February', desktop: 305, mobile: 200 },
	{ month: 'March', desktop: 237, mobile: 120 },
	{ month: 'April', desktop: 73, mobile: 190 },
	{ month: 'May', desktop: 209, mobile: 130 },
	{ month: 'June', desktop: 214, mobile: 140 },
];

const config = {
	desktop: { label: 'Desktop', color: 'var(--chart-1)' },
	mobile: { label: 'Mobile', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const monthAxis = (
	<XAxis
		dataKey="month"
		tickLine={false}
		tickMargin={10}
		axisLine={false}
		tickFormatter={(month: string) => month.slice(0, 3)}
	/>
);

/**
 * Charts drawn with Recharts and themed with the app's tokens. ChartContainer takes a `config`
 * mapping each data key to a `label` and a `color` (or per-theme colors in `theme`), which the
 * chart reads as `var(--color-<key>)`; put a Recharts chart inside it and size the container
 * (`aspect-video` by default, or a `min-h-*` class). ChartTooltip with ChartTooltipContent
 * (`indicator`: `dot`, `line` or `dashed`; `hideLabel`, `hideIndicator`) and ChartLegend with
 * ChartLegendContent take their labels from the config. Import the chart parts from `recharts`;
 * an app that draws charts lists `recharts` in its own dependencies, since pnpm doesn't hoist
 * packages/ui's. Never put user input in a ChartConfig: ChartStyle writes it unescaped into a
 * `<style>` tag.
 *
 * @summary Recharts charts themed by a key-to-label-and-color config
 */
const meta = {
	component: ChartContainer,
	subcomponents: { ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent },
	args: {
		config,
		className: 'min-h-64 w-full max-w-xl',
		children: (
			<BarChart accessibilityLayer data={visitors}>
				<CartesianGrid vertical={false} />
				{monthAxis}
				<ChartTooltip content={<ChartTooltipContent />} />
				<ChartLegend content={<ChartLegendContent />} />
				<Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
				<Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
			</BarChart>
		),
	},
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A bar chart with a tooltip and legend. Focusing the chart opens the tooltip; arrow keys move it. */
export const Bars: Story = {
	play: async ({ canvas, userEvent }) => {
		await userEvent.tab();
		await expect(await canvas.findByText('January')).toBeVisible();
		await userEvent.keyboard('{ArrowRight}');
		await expect(await canvas.findByText('February')).toBeVisible();
	},
};

/** The same config drives a line chart; `indicator="line"` styles the tooltip. */
export const Lines: Story = {
	args: {
		children: (
			<LineChart accessibilityLayer data={visitors} margin={{ left: 12, right: 12 }}>
				<CartesianGrid vertical={false} />
				{monthAxis}
				<ChartTooltip content={<ChartTooltipContent indicator="line" />} />
				<Line dataKey="desktop" type="monotone" stroke="var(--color-desktop)" strokeWidth={2} dot={false} />
				<Line dataKey="mobile" type="monotone" stroke="var(--color-mobile)" strokeWidth={2} dot={false} />
			</LineChart>
		),
	},
};

function DeviceIcon() {
	return (
		<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
			<rect x="3" y="4" width="18" height="12" rx="2" />
			<path d="M8 20h8" />
		</svg>
	);
}

/** Bar chart whose tooltip is open on February, so the content options are visible without hovering. */
function openTooltipChart(
	tooltip: ComponentProps<typeof ChartTooltip>['content'],
	legend?: ComponentProps<typeof ChartLegend>['content'],
	series: ('desktop' | 'mobile')[] = ['desktop', 'mobile']
) {
	return (
		<BarChart accessibilityLayer data={visitors}>
			<CartesianGrid vertical={false} />
			{monthAxis}
			<ChartTooltip defaultIndex={1} content={tooltip} />
			{legend ? <ChartLegend content={legend} /> : null}
			{series.map((key) => (
				<Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
			))}
		</BarChart>
	);
}

/** `labelFormatter` rewrites the tooltip heading; it receives the resolved label and the payload. */
export const LabelFormatter: Story = {
	args: {
		children: openTooltipChart(<ChartTooltipContent labelFormatter={(value) => `Month: ${String(value)}`} />),
	},
	play: async ({ canvas }) => {
		await expect(await canvas.findByText('Month: February', undefined, { timeout: 5000 })).toBeVisible();
	},
};

/**
 * `formatter` replaces each tooltip row; it gets the value, the series name, and the whole item.
 *
 * @summary `formatter` on ChartTooltipContent replaces each tooltip row
 */
export const ValueFormatter: Story = {
	args: {
		children: openTooltipChart(
			<ChartTooltipContent
				formatter={(value, name) => <span>{`${String(name)}: ${String(value)} visitors`}</span>}
			/>
		),
	},
	play: async ({ canvas }) => {
		await expect(await canvas.findByText('desktop: 305 visitors', undefined, { timeout: 5000 })).toBeVisible();
		await expect(canvas.getByText('mobile: 200 visitors')).toBeVisible();
	},
};

const browsers = [
	{ browser: 'chrome', visitors: 275, fill: 'var(--color-chrome)' },
	{ browser: 'safari', visitors: 200, fill: 'var(--color-safari)' },
];

/**
 * Data keyed by category rather than by series: `nameKey` and `labelKey` name the data field whose
 * value (here `chrome`) is looked up in the config, so the tooltip shows the config label.
 *
 * @summary `nameKey` and `labelKey` for data keyed by category instead of by series
 */
export const NameKeyAndLabelKey: Story = {
	args: {
		config: {
			visitors: { label: 'Visitors' },
			chrome: { label: 'Chrome', color: 'var(--chart-1)' },
			safari: { label: 'Safari', color: 'var(--chart-2)' },
		},
		children: (
			<BarChart accessibilityLayer data={browsers}>
				<XAxis dataKey="browser" tickLine={false} axisLine={false} />
				<ChartTooltip defaultIndex={0} content={<ChartTooltipContent nameKey="browser" labelKey="browser" />} />
				<Bar dataKey="visitors" radius={4} />
			</BarChart>
		),
	},
	play: async ({ canvas }) => {
		await expect((await canvas.findAllByText('Chrome', undefined, { timeout: 5000 })).length).toBe(2);
		await expect(canvas.getByText('275')).toBeVisible();
	},
};

/** With one series, `indicator="line"` moves the label next to the value. */
export const SingleSeriesLineIndicator: Story = {
	args: { children: openTooltipChart(<ChartTooltipContent indicator="line" />, undefined, ['desktop']) },
	play: async ({ canvas }) => {
		await expect(await canvas.findByText('305', undefined, { timeout: 5000 })).toBeVisible();
	},
};

/** `indicator="dashed"` draws a dashed marker; with one series the label nests beside it. */
export const SingleSeriesDashedIndicator: Story = {
	args: { children: openTooltipChart(<ChartTooltipContent indicator="dashed" />, undefined, ['desktop']) },
	play: async ({ canvas }) => {
		await expect(await canvas.findByText('305', undefined, { timeout: 5000 })).toBeVisible();
	},
};

/** `hideLabel` and `hideIndicator` leave only the series names and values. */
export const HideLabelAndIndicator: Story = {
	args: { children: openTooltipChart(<ChartTooltipContent hideLabel hideIndicator />) },
	play: async ({ canvas }) => {
		await expect(await canvas.findByText('305', undefined, { timeout: 5000 })).toBeVisible();
		await expect(canvas.queryByText('February')).toBeNull();
	},
};

/**
 * A config with labels only, no `color` or `theme`: ChartStyle renders nothing and series set their own fill.
 *
 * @summary A config without colors, for series that set their own fill
 */
export const WithoutColors: Story = {
	args: {
		config: { desktop: { label: 'Desktop' }, mobile: { label: 'Mobile' } },
		children: (
			<BarChart accessibilityLayer data={visitors}>
				{monthAxis}
				<ChartTooltip defaultIndex={1} content={<ChartTooltipContent />} />
				<Bar dataKey="desktop" fill="var(--chart-1)" radius={4} />
				<Bar dataKey="mobile" fill="var(--chart-2)" radius={4} />
			</BarChart>
		),
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(await canvas.findByText('Desktop', undefined, { timeout: 5000 })).toBeVisible();
		await expect(canvasElement.querySelector('[data-slot="chart"] > style')).toBeNull();
	},
};

/**
 * Per-theme colors: `theme` gives a color for light and one for dark instead of a single `color`.
 *
 * @summary `theme` in the config sets separate light and dark colors
 */
export const ThemeColors: Story = {
	args: {
		config: {
			desktop: { label: 'Desktop', theme: { light: 'oklch(0.55 0.2 260)', dark: 'oklch(0.75 0.15 260)' } },
			mobile: { label: 'Mobile', color: 'var(--chart-2)' },
		},
	},
	play: async ({ canvasElement }) => {
		const css = canvasElement.querySelector('[data-slot="chart"] > style')?.textContent ?? '';
		await expect(css).toContain('--color-desktop: oklch(0.55 0.2 260);');
		await expect(css).toContain('--color-desktop: oklch(0.75 0.15 260);');
		await expect(css).toContain('--color-mobile: var(--chart-2);');
	},
};

const iconConfig = {
	desktop: { label: 'Desktop', color: 'var(--chart-1)', icon: DeviceIcon },
	mobile: { label: 'Mobile', color: 'var(--chart-2)' },
} satisfies ChartConfig;

/** A config `icon` replaces the colored square in the tooltip and the legend. */
export const Icons: Story = {
	args: {
		config: iconConfig,
		children: openTooltipChart(<ChartTooltipContent />, <ChartLegendContent />),
	},
	play: async ({ canvasElement, canvas }) => {
		await expect((await canvas.findAllByText('Desktop', undefined, { timeout: 5000 })).length).toBe(2);
		await expect(canvasElement.querySelectorAll('svg[viewBox="0 0 24 24"]').length).toBe(2);
	},
};

/**
 * `verticalAlign="top"` on ChartLegend puts the legend above the chart, next to a title for example.
 *
 * @summary `verticalAlign="top"` on ChartLegend puts the legend above the chart
 */
export const TopLegend: Story = {
	args: {
		children: (
			<BarChart accessibilityLayer data={visitors}>
				<CartesianGrid vertical={false} />
				{monthAxis}
				<ChartLegend verticalAlign="top" content={<ChartLegendContent />} />
				<Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
				<Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
			</BarChart>
		),
	},
	play: async ({ canvas }) => {
		await expect(await canvas.findByText('Desktop', undefined, { timeout: 5000 })).toBeVisible();
	},
};

/** `hideIcon` on the legend shows the colored square even when the config has an icon. */
export const LegendHideIcon: Story = {
	args: {
		config: iconConfig,
		children: openTooltipChart(<ChartTooltipContent />, <ChartLegendContent hideIcon />),
	},
	play: async ({ canvasElement, canvas }) => {
		await expect((await canvas.findAllByText('Desktop', undefined, { timeout: 5000 })).length).toBe(2);
		// Only the tooltip row keeps its icon.
		await expect(canvasElement.querySelectorAll('svg[viewBox="0 0 24 24"]').length).toBe(1);
	},
};
