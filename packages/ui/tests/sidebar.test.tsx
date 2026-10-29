import { useSidebar } from '@repo/ui/components/sidebar';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, test } from 'vitest';

// React's act() warns unless the environment says it supports it.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function Probe() {
	useSidebar();
	return null;
}

test('useSidebar throws outside a SidebarProvider', async () => {
	const root = createRoot(document.createElement('div'));

	await expect(act(async () => root.render(<Probe />))).rejects.toThrow(
		'useSidebar must be used within a SidebarProvider.'
	);
});
