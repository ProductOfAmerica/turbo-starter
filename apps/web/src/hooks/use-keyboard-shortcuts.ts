'use client';

import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
	onCommandPalette: () => void;
	onOpenConfig: () => void;
	onTogglePlayPause: () => void;
	onStart: () => void;
	onToggleDryRun: () => void;
	onExportTrades: () => void;
	onShowShortcuts: () => void;
	canStart: boolean;
	canTogglePlayPause: boolean;
}

export function useKeyboardShortcuts({
	onCommandPalette,
	onOpenConfig,
	onTogglePlayPause,
	onStart,
	onToggleDryRun,
	onExportTrades,
	onShowShortcuts,
	canStart,
	canTogglePlayPause,
}: KeyboardShortcutsConfig) {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				onCommandPalette();
				return;
			}

			if (e.key === ',' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				onOpenConfig();
				return;
			}

			if (isInput) return;

			if (e.key === ' ') {
				e.preventDefault();
				if (canTogglePlayPause) {
					onTogglePlayPause();
				}
				return;
			}

			if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				if (canStart) {
					onStart();
				}
				return;
			}

			if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				onToggleDryRun();
				return;
			}

			if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				onExportTrades();
				return;
			}

			if (e.key === '?') {
				e.preventDefault();
				onShowShortcuts();
				return;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [
		onCommandPalette,
		onOpenConfig,
		onTogglePlayPause,
		onStart,
		onToggleDryRun,
		onExportTrades,
		onShowShortcuts,
		canStart,
		canTogglePlayPause,
	]);
}
