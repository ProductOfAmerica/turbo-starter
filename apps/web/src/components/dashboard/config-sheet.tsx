'use client';

import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Separator } from '@repo/ui/components/separator';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@repo/ui/components/sheet';
import { Slider } from '@repo/ui/components/slider';
import { cn } from '@repo/ui/lib/utils';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { Config, GameType } from '@/services/types';

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

interface ApiStatus {
	name: string;
	status: 'connected' | 'error' | 'checking';
	detail?: string;
}

interface ConfigSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	config: Config;
	onSave: (config: Config) => void;
}

const defaultConfig: Config = {
	game: 'lol',
	matchId: '',
	marketId: undefined,
	edgeThreshold: 5,
	orderSize: 10,
	maxPosition: 100,
	pollingInterval: 2000,
};

export function ConfigSheet({ open, onOpenChange, config, onSave }: ConfigSheetProps) {
	const [localConfig, setLocalConfig] = useState<Config>(config);
	const [matchValidation, setMatchValidation] = useState<ValidationState>('idle');
	const [apiStatuses] = useState<ApiStatus[]>([
		{ name: 'Polymarket', status: 'connected', detail: '0x1234...5678' },
		{ name: 'PandaScore', status: 'connected' },
		{ name: 'OpenDota', status: 'connected' },
	]);

	const handleVerifyMatch = async () => {
		setMatchValidation('validating');
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setMatchValidation(localConfig.matchId.length > 3 ? 'valid' : 'invalid');
	};

	const handleReset = () => {
		setLocalConfig(defaultConfig);
		setMatchValidation('idle');
	};

	const handleSave = () => {
		onSave(localConfig);
		onOpenChange(false);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-[400px] overflow-y-auto sm:w-[540px]">
				<SheetHeader>
					<SheetTitle>Configuration</SheetTitle>
					<SheetDescription>Configure match tracking and trading parameters</SheetDescription>
				</SheetHeader>

				<div className="space-y-8 py-6">
					<div className="space-y-4">
						<h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
							Match Configuration
						</h3>

						<div className="space-y-3">
							<Label htmlFor="game">Game</Label>
							<Select
								value={localConfig.game}
								onValueChange={(v) => setLocalConfig({ ...localConfig, game: v as GameType })}
							>
								<SelectTrigger id="game">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="lol">League of Legends</SelectItem>
									<SelectItem value="dota">Dota 2</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-3">
							<Label htmlFor="matchId">Match ID</Label>
							<div className="flex gap-2">
								<div className="relative flex-1">
									<Input
										id="matchId"
										placeholder="Enter match ID"
										value={localConfig.matchId}
										onChange={(e) => {
											setLocalConfig({ ...localConfig, matchId: e.target.value });
											setMatchValidation('idle');
										}}
										className={cn(
											'pr-8',
											matchValidation === 'valid' && 'border-green-500',
											matchValidation === 'invalid' && 'border-destructive'
										)}
									/>
									{matchValidation === 'valid' && (
										<CheckCircle className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
									)}
									{matchValidation === 'invalid' && (
										<XCircle className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
									)}
								</div>
								<Button
									variant="secondary"
									onClick={handleVerifyMatch}
									disabled={matchValidation === 'validating' || !localConfig.matchId}
								>
									{matchValidation === 'validating' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
								</Button>
							</div>
							<p className="text-sm text-muted-foreground">
								Find match IDs on PandaScore or the game&apos;s esports site
							</p>
						</div>

						<div className="space-y-3">
							<Label htmlFor="marketId">Market ID (Optional)</Label>
							<Input
								id="marketId"
								placeholder="Auto-detect from match"
								value={localConfig.marketId ?? ''}
								onChange={(e) => setLocalConfig({ ...localConfig, marketId: e.target.value || undefined })}
							/>
							<p className="text-sm text-muted-foreground">Override automatic market detection</p>
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
							Trading Parameters
						</h3>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label>Edge Threshold</Label>
								<span className="text-sm font-mono tabular-nums text-muted-foreground">
									{localConfig.edgeThreshold.toFixed(1)}%
								</span>
							</div>
							<Slider
								value={[localConfig.edgeThreshold]}
								onValueChange={([v]) => setLocalConfig({ ...localConfig, edgeThreshold: v ?? 5 })}
								min={1}
								max={20}
								step={0.5}
							/>
							<p className="text-sm text-muted-foreground">Minimum edge required to execute trades</p>
						</div>

						<div className="space-y-3">
							<Label htmlFor="orderSize">Order Size ($)</Label>
							<Input
								id="orderSize"
								type="number"
								min={1}
								max={1000}
								value={localConfig.orderSize}
								onChange={(e) => setLocalConfig({ ...localConfig, orderSize: Number(e.target.value) })}
							/>
						</div>

						<div className="space-y-3">
							<Label htmlFor="maxPosition">Max Position ($)</Label>
							<Input
								id="maxPosition"
								type="number"
								min={10}
								max={10000}
								value={localConfig.maxPosition}
								onChange={(e) => setLocalConfig({ ...localConfig, maxPosition: Number(e.target.value) })}
							/>
							<p className="text-sm text-muted-foreground">Maximum total exposure before pausing trades</p>
						</div>

						<div className="space-y-3">
							<Label htmlFor="pollingInterval">Polling Interval</Label>
							<Select
								value={String(localConfig.pollingInterval)}
								onValueChange={(v) => setLocalConfig({ ...localConfig, pollingInterval: Number(v) })}
							>
								<SelectTrigger id="pollingInterval">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1000">1s</SelectItem>
									<SelectItem value="2000">2s</SelectItem>
									<SelectItem value="5000">5s</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">API Status</h3>

						<div className="space-y-2">
							{apiStatuses.map((api) => (
								<div key={api.name} className="flex items-center justify-between rounded-md border px-3 py-2">
									<div className="flex items-center gap-2">
										<span
											className={cn(
												'h-2 w-2 rounded-full',
												api.status === 'connected' && 'bg-green-500',
												api.status === 'error' && 'bg-destructive',
												api.status === 'checking' && 'bg-yellow-500 animate-pulse'
											)}
										/>
										<span className="text-sm font-medium">{api.name}</span>
									</div>
									{api.detail && <span className="font-mono text-xs text-muted-foreground">{api.detail}</span>}
								</div>
							))}
						</div>
					</div>
				</div>

				<SheetFooter>
					<Button variant="outline" onClick={handleReset}>
						Reset to Defaults
					</Button>
					<Button onClick={handleSave}>Save Configuration</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
