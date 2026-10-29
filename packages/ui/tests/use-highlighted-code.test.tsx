import { useHighlightedCode } from '@repo/ui/hooks/use-highlighted-code';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';

const { loadHighlighter } = vi.hoisted(() => ({ loadHighlighter: vi.fn() }));

vi.mock('@repo/ui/lib/highlighter', () => ({ loadHighlighter }));

// React's act() warns unless the environment says it supports it.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let lines: unknown[] = [];

function Probe({ value }: { value: string }) {
	lines = useHighlightedCode(value, 'tsx');
	return null;
}

afterEach(() => {
	loadHighlighter.mockReset();
});

test('drops a trailing newline instead of rendering an empty last line', async () => {
	loadHighlighter.mockResolvedValue(null);
	const root = createRoot(document.createElement('div'));
	await act(async () => root.render(<Probe value={'a\nb\n'} />));

	expect(lines).toEqual(['a', 'b']);
	await act(async () => root.unmount());
});

test('keeps plain lines when the grammar fails to load', async () => {
	loadHighlighter.mockRejectedValue(new Error('no grammar'));
	const root = createRoot(document.createElement('div'));
	await act(async () => root.render(<Probe value="a" />));

	expect(loadHighlighter).toHaveBeenCalledWith('tsx');
	expect(lines).toEqual(['a']);
	await act(async () => root.unmount());
});

test('ignores a grammar that finishes loading after unmount', async () => {
	let resolve: (value: null) => void = () => {};
	loadHighlighter.mockReturnValue(new Promise((r) => (resolve = r)));
	const root = createRoot(document.createElement('div'));
	await act(async () => root.render(<Probe value="a" />));
	await act(async () => root.unmount());
	await act(async () => resolve(null));

	expect(lines).toEqual(['a']);
});
