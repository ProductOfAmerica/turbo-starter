'use client';

import { Button } from '@repo/ui/components/button';
import { Separator } from '@repo/ui/components/separator';
import { Search, Settings } from 'lucide-react';

interface HeaderProps {
	matchInfo: string | null;
	onCommandOpen: () => void;
	onSettingsOpen: () => void;
}

export function Header({ matchInfo, onCommandOpen, onSettingsOpen }: HeaderProps) {
	return (
		<header className="sticky top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-full items-center justify-between px-6">
				<div className="flex items-center gap-4">
					<span className="font-semibold">Esports Trading Bot</span>
					<Separator orientation="vertical" className="h-6" />
					<span className="text-sm text-muted-foreground">{matchInfo ?? 'No match selected'}</span>
				</div>

				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" className="gap-2" onClick={onCommandOpen}>
						<Search className="h-4 w-4" />
						<span className="hidden sm:inline">Search commands...</span>
						<kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
							<span className="text-xs">⌘</span>K
						</kbd>
					</Button>
					<Button variant="ghost" size="icon" onClick={onSettingsOpen}>
						<Settings className="h-4 w-4" />
						<span className="sr-only">Settings</span>
					</Button>
				</div>
			</div>
		</header>
	);
}
