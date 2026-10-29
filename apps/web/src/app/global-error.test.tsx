// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';
import GlobalError from './global-error';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

test('replaces the whole document, since the root layout failed', () => {
	const html = renderToStaticMarkup(<GlobalError error={new Error('boom')} reset={() => {}} />);
	expect(html).toMatch(/^<html lang="en">.*<body>/);
	expect(html).toContain('Something went wrong');
});

test('Try again calls reset', async () => {
	const reset = vi.fn();
	// GlobalError renders <html>, which React can only mount as the document itself.
	const root = createRoot(document);
	await act(async () => root.render(<GlobalError error={new Error('boom')} reset={reset} />));
	const button = document.querySelector('button');
	expect(button?.textContent).toBe('Try again');
	await act(async () => button?.click());
	expect(reset).toHaveBeenCalledOnce();
	await act(async () => root.unmount());
});
