import { Toaster } from '@repo/ui/components/sonner';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test, vi } from 'vitest';

const { sonner } = vi.hoisted(() => ({ sonner: vi.fn(() => null) }));

vi.mock('sonner', () => ({ Toaster: sonner }));

// React's act() warns unless the environment says it supports it.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Without a ThemeProvider, next-themes' useTheme returns no theme. Storybook's preview always has one.
test('follows the system theme when there is no ThemeProvider', async () => {
	const root = createRoot(document.createElement('div'));
	await act(async () => root.render(<Toaster />));

	expect(sonner).toHaveBeenCalledWith(expect.objectContaining({ theme: 'system' }), undefined);
});
