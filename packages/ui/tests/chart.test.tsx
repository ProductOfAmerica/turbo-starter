import { ChartContainer, ChartLegendContent, ChartTooltipContent } from '@repo/ui/components/chart';
import type { ReactNode } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: ReturnType<typeof createRoot> | undefined;
let host: HTMLElement | undefined;

function mount(node: ReactNode) {
	host = document.createElement('div');
	document.body.append(host);
	root = createRoot(host);
	act(() => root?.render(node));
	return host;
}

afterEach(() => {
	act(() => root?.unmount());
	host?.remove();
	root = undefined;
	host = undefined;
	vi.restoreAllMocks();
});

// The browser lays the chart out, so it needs a size to render anything.
const size = { width: 400, height: 200 };

const config = {
	chrome: { label: 'Chrome' },
	desktop: { label: 'Desktop' },
};

// Hand-written props: recharts never produces these payload shapes, but the components accept them.
function tooltip(props: Record<string, unknown>) {
	return (
		<ChartContainer style={size} config={config}>
			<ChartTooltipContent {...({ active: true, ...props } as unknown as Record<string, never>)} />
		</ChartContainer>
	);
}

describe('chart parts outside ChartContainer', () => {
	it('throws from useChart', () => {
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
		expect(() => mount(<ChartLegendContent payload={[{ dataKey: 'a', color: 'red' } as never]} />)).toThrow(
			'useChart must be used within a <ChartContainer />'
		);
	});
});

describe('ChartTooltipContent', () => {
	it('omits the label when no config label matches', () => {
		const el = mount(tooltip({ payload: [{ name: 'other', dataKey: 'other', value: 1, color: 'red' }] }));
		expect(el.textContent).toContain('other');
		expect(el.querySelector('.grid > .font-medium')).toBeNull();
	});

	it('stringifies non-numeric values and falls back to dataKey then value for the key', () => {
		const el = mount(
			tooltip({
				payload: [
					{ dataKey: 'desktop', value: 'n/a', color: 'red' },
					{ value: 3, color: 'blue' },
				],
			})
		);
		expect(el.textContent).toContain('Desktop');
		expect(el.textContent).toContain('n/a');
		expect(el.textContent).toContain('3');
	});

	it('uses the formatter for items that have a name and a value', () => {
		const formatter = vi.fn(() => <span>custom</span>);
		const el = mount(tooltip({ formatter, payload: [{ name: 'desktop', value: 1, color: 'red' }] }));
		expect(el.textContent).toContain('custom');
		expect(formatter).toHaveBeenCalledTimes(1);
	});

	it('tolerates non-object payload items', () => {
		expect(() => mount(tooltip({ payload: ['text'] }))).not.toThrow();
	});

	it('reads the config key from the item itself or from item.payload', () => {
		const el = mount(
			tooltip({
				labelKey: 'kind',
				nameKey: 'browser',
				payload: [{ kind: 'chrome', value: 1, payload: { browser: 'chrome' }, color: 'red' }],
			})
		);
		expect(el.textContent?.match(/Chrome/g)?.length).toBe(2);
	});

	it('falls back to the raw key when payload.payload holds a non-string', () => {
		const el = mount(
			tooltip({ nameKey: 'browser', payload: [{ name: 'x', value: 1, payload: { browser: 5 }, color: 'red' }] })
		);
		expect(el.textContent).toContain('1');
	});
});

describe('ChartLegendContent', () => {
	it('defaults to the bottom alignment and uses dataKey for the key', () => {
		const el = mount(
			<ChartContainer style={size} config={config}>
				<ChartLegendContent payload={[{ dataKey: 'desktop', color: 'red', value: 'x' } as never]} />
			</ChartContainer>
		);
		expect(el.textContent).toContain('Desktop');
		expect(el.querySelector('.pt-3')).not.toBeNull();
	});

	it('falls back to the value key when the item has no dataKey', () => {
		const el = mount(
			<ChartContainer style={size} config={{ value: { label: 'Fallback' } }}>
				<ChartLegendContent payload={[{ color: 'red', value: 'x' } as never]} />
			</ChartContainer>
		);
		expect(el.textContent).toContain('Fallback');
	});

	it('renders nothing without a payload', () => {
		const el = mount(
			<ChartContainer style={size} config={config}>
				<ChartLegendContent />
			</ChartContainer>
		);
		expect(el.querySelector('.pt-3')).toBeNull();
	});
});

describe('ChartStyle', () => {
	it('skips a theme that has no color for it', () => {
		const el = mount(
			<ChartContainer style={size} config={{ a: { theme: { light: 'red' } } as never }}>
				{<div />}
			</ChartContainer>
		);
		const css = el.querySelector('style')?.textContent ?? '';
		expect(css).toContain('--color-a: red;');
		expect(css.match(/--color-a/g)?.length).toBe(1);
	});
});
