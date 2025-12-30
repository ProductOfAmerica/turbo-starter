'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@repo/ui/components/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

interface StopDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	sessionPnL: number;
	position: number;
	positionDirection: 'LONG' | 'SHORT' | 'FLAT';
}

function formatCurrency(value: number): string {
	const sign = value >= 0 ? '+' : '';
	return `${sign}$${Math.abs(value).toFixed(2)}`;
}

export function StopDialog({
	open,
	onOpenChange,
	onConfirm,
	sessionPnL,
	position,
	positionDirection,
}: StopDialogProps) {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Stop Trading Bot?</AlertDialogTitle>
					<AlertDialogDescription asChild>
						<div className="space-y-4">
							<p>This will end the current trading session.</p>

							<div className="rounded-md border bg-muted/50 p-3 space-y-1">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Session P&L</span>
									<span
										className={cn(
											'font-mono tabular-nums font-medium',
											sessionPnL >= 0 ? 'text-green-600' : 'text-red-600'
										)}
									>
										{formatCurrency(sessionPnL)}
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Open Position</span>
									<span className="font-mono tabular-nums font-medium">
										{Math.abs(position)} shares {positionDirection}
									</span>
								</div>
							</div>

							{positionDirection !== 'FLAT' && (
								<div className="flex items-center gap-2 text-sm text-yellow-600">
									<AlertTriangle className="h-4 w-4" />
									<span>Open positions will remain open on Polymarket</span>
								</div>
							)}
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						Stop Bot
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
