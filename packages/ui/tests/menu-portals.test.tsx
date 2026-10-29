import { ContextMenu, ContextMenuPortal } from '@repo/ui/components/context-menu';
import { DropdownMenu, DropdownMenuPortal } from '@repo/ui/components/dropdown-menu';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test } from 'vitest';

// Both Portal wrappers are exported for custom menu content, but the Content components already portal
// themselves, so no story renders them. Radix only mounts a portal's children while the menu is open.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
	document.body.innerHTML = '';
});

test('DropdownMenuPortal renders its children into document.body', async () => {
	const host = document.body.appendChild(document.createElement('div'));
	await act(async () => {
		createRoot(host).render(
			<DropdownMenu open>
				<DropdownMenuPortal>
					<p>portaled</p>
				</DropdownMenuPortal>
			</DropdownMenu>
		);
	});
	expect(host.textContent).toBe('');
	expect(document.body.textContent).toContain('portaled');
});

test('ContextMenuPortal is a wrapper that renders inside a ContextMenu', async () => {
	const host = document.body.appendChild(document.createElement('div'));
	await act(async () => {
		createRoot(host).render(
			<ContextMenu>
				<ContextMenuPortal>
					<p>portaled</p>
				</ContextMenuPortal>
			</ContextMenu>
		);
	});
	// Closed context menus mount nothing; the render only has to complete without throwing.
	expect(host.textContent).toBe('');
});
