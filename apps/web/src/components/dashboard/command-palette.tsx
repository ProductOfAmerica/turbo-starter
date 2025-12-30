'use client';

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from '@repo/ui/components/command';
import {
	Download,
	FlaskConical,
	Image,
	Keyboard,
	LineChart,
	Pause,
	Play,
	Radio,
	Settings,
	Square,
	TrendingUp,
} from 'lucide-react';
import type { BotStatus } from '@/services/types';

interface CommandPaletteProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	botStatus: BotStatus;
	dryRun: boolean;
	onStart: () => void;
	onPause: () => void;
	onResume: () => void;
	onStop: () => void;
	onToggleDryRun: () => void;
	onOpenConfig: () => void;
	onExportTrades: () => void;
	onExportChart: () => void;
	onFocusChart: () => void;
	onFocusEvents: () => void;
	onFocusTrades: () => void;
	onShowShortcuts: () => void;
}

export function CommandPalette({
	open,
	onOpenChange,
	botStatus,
	dryRun,
	onStart,
	onPause,
	onResume,
	onStop,
	onToggleDryRun,
	onOpenConfig,
	onExportTrades,
	onExportChart,
	onFocusChart,
	onFocusEvents,
	onFocusTrades,
	onShowShortcuts,
}: CommandPaletteProps) {
	const runCommand = (command: () => void) => {
		onOpenChange(false);
		command();
	};

	const canStart = botStatus === 'IDLE' || botStatus === 'STOPPED';
	const canPause = botStatus === 'RUNNING';
	const canResume = botStatus === 'PAUSED';
	const canStop = botStatus === 'RUNNING' || botStatus === 'PAUSED';

	return (
		<CommandDialog open={open} onOpenChange={onOpenChange}>
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>

				<CommandGroup heading="Actions">
					{canStart && (
						<CommandItem onSelect={() => runCommand(onStart)}>
							<Play className="mr-2 h-4 w-4" />
							Start Bot
							<CommandShortcut>⌘Enter</CommandShortcut>
						</CommandItem>
					)}
					{canPause && (
						<CommandItem onSelect={() => runCommand(onPause)}>
							<Pause className="mr-2 h-4 w-4" />
							Pause Bot
							<CommandShortcut>Space</CommandShortcut>
						</CommandItem>
					)}
					{canResume && (
						<CommandItem onSelect={() => runCommand(onResume)}>
							<Play className="mr-2 h-4 w-4" />
							Resume Bot
							<CommandShortcut>Space</CommandShortcut>
						</CommandItem>
					)}
					{canStop && (
						<CommandItem onSelect={() => runCommand(onStop)}>
							<Square className="mr-2 h-4 w-4" />
							Stop Bot
						</CommandItem>
					)}
					<CommandItem onSelect={() => runCommand(onToggleDryRun)}>
						<FlaskConical className="mr-2 h-4 w-4" />
						Toggle Dry Run {dryRun ? '(Currently ON)' : '(Currently OFF)'}
						<CommandShortcut>⌘D</CommandShortcut>
					</CommandItem>
				</CommandGroup>

				<CommandSeparator />

				<CommandGroup heading="Navigation">
					<CommandItem onSelect={() => runCommand(onOpenConfig)}>
						<Settings className="mr-2 h-4 w-4" />
						Open Configuration
						<CommandShortcut>⌘,</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => runCommand(onFocusChart)}>
						<LineChart className="mr-2 h-4 w-4" />
						Focus Chart
					</CommandItem>
					<CommandItem onSelect={() => runCommand(onFocusEvents)}>
						<Radio className="mr-2 h-4 w-4" />
						Focus Events
					</CommandItem>
					<CommandItem onSelect={() => runCommand(onFocusTrades)}>
						<TrendingUp className="mr-2 h-4 w-4" />
						Focus Trades
					</CommandItem>
				</CommandGroup>

				<CommandSeparator />

				<CommandGroup heading="Export">
					<CommandItem onSelect={() => runCommand(onExportTrades)}>
						<Download className="mr-2 h-4 w-4" />
						Export Trade History
						<CommandShortcut>⌘E</CommandShortcut>
					</CommandItem>
					<CommandItem onSelect={() => runCommand(onExportChart)}>
						<Image className="mr-2 h-4 w-4" />
						Export Chart as PNG
					</CommandItem>
				</CommandGroup>

				<CommandSeparator />

				<CommandGroup heading="Help">
					<CommandItem onSelect={() => runCommand(onShowShortcuts)}>
						<Keyboard className="mr-2 h-4 w-4" />
						Keyboard Shortcuts
						<CommandShortcut>?</CommandShortcut>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	);
}
