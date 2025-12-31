'use client';

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/components/popover';
import { Separator } from '@repo/ui/components/separator';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@repo/ui/components/sheet';
import { Slider } from '@repo/ui/components/slider';
import { Switch } from '@repo/ui/components/switch';
import { cn } from '@repo/ui/lib/utils';
import { ArrowDownAZ, BarChart3, Layers, Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import type { StrategyName } from '@/services/strategies';
import type { Config, KalshiMarket } from '@/services/types';

interface ConfigSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	config: Config;
	onSave: (config: Config) => void;
	currentStrategy: StrategyName;
	availableStrategies: StrategyName[];
	onStrategyChange: (strategy: StrategyName) => void;
	isBotRunning: boolean;
	dryRun: boolean;
	onDryRunChange: (checked: boolean) => void;
}

const defaultConfig: Config = {
	marketTicker: '',
	edgeThreshold: 5,
	orderSize: 10,
	maxPosition: 100,
};

const strategyDescriptions: Record<StrategyName, string> = {
	'market-maker': 'EMA-based market making with inventory skew',
	momentum: 'Trend-following based on price momentum',
};

export function ConfigSheet({
	open,
	onOpenChange,
	config,
	onSave,
	currentStrategy,
	availableStrategies,
	onStrategyChange,
	isBotRunning,
	dryRun,
	onDryRunChange,
}: ConfigSheetProps) {
	const [localConfig, setLocalConfig] = useState<Config>(config);
	const [markets, setMarkets] = useState<KalshiMarket[]>([]);
	const [isPending, startTransition] = useTransition();
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<'volume24h' | 'spread' | 'openInterest'>('volume24h');
	const [minVolume, setMinVolume] = useState<number>(0);
	const [categoryOpen, setCategoryOpen] = useState(false);
	const [sortOpen, setSortOpen] = useState(false);
	const [volumeOpen, setVolumeOpen] = useState(false);

	const fetchMarkets = useCallback(async (category: string, minVol: number, isDryRun: boolean) => {
		try {
			const params = new URLSearchParams({ status: 'open', limit: '50' });
			params.set('mode', isDryRun ? 'demo' : 'prod');
			if (category !== 'all') {
				params.set('category', category);
			}
			if (minVol > 0) {
				params.set('minVolume', String(minVol));
			}
			const res = await fetch(`/api/kalshi/markets?${params}`);
			if (res.ok) {
				const data = await res.json();
				startTransition(() => {
					setMarkets(data.markets || []);
				});
			}
		} catch (err) {
			console.error('Failed to fetch markets:', err);
		}
	}, []);

	useEffect(() => {
		if (open) {
			setLocalConfig(config);
		}
	}, [open, config]);

	useEffect(() => {
		if (open) {
			fetchMarkets(categoryFilter, minVolume, dryRun);
		}
	}, [categoryFilter, minVolume, dryRun, open, fetchMarkets]);

	const handleSelectMarket = (market: KalshiMarket) => {
		setLocalConfig({ ...localConfig, marketTicker: market.ticker });
	};

	const handleReset = () => {
		setLocalConfig(defaultConfig);
	};

	const handleSave = () => {
		onSave(localConfig);
		onOpenChange(false);
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			onSave(localConfig);
		}
		onOpenChange(newOpen);
	};

	const formatPrice = (price: number) => `${Math.round(price * 100)}¢`;

	const filteredAndSortedMarkets = [...markets].sort((a, b) => {
		if (sortBy === 'volume24h') return b.volume24h - a.volume24h;
		if (sortBy === 'spread') return a.spreadBps - b.spreadBps;
		if (sortBy === 'openInterest') return b.openInterest - a.openInterest;
		return 0;
	});

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetContent className="w-[500px] overflow-y-auto sm:w-[640px]">
				<SheetHeader>
					<SheetTitle>Configuration</SheetTitle>
					<SheetDescription>Select a Kalshi market and configure trading parameters</SheetDescription>
				</SheetHeader>

				<div className="space-y-8 py-6">
					<div className="flex items-center justify-between rounded-md border px-4 py-3">
						<div className="space-y-0.5">
							<Label htmlFor="dry-run-config">Dry Run Mode</Label>
							<p className="text-sm text-muted-foreground">
								{dryRun ? 'Using demo API (simulated trades)' : 'Using production API (real trades)'}
							</p>
						</div>
						<div className="flex items-center gap-2">
							{dryRun && (
								<Badge variant="secondary" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-600">
									DEMO
								</Badge>
							)}
							<Switch
								id="dry-run-config"
								checked={dryRun}
								onCheckedChange={onDryRunChange}
								disabled={isBotRunning}
							/>
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
							Market Selection
						</h3>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label>Available Markets</Label>
								<div className="flex items-center gap-1">
									<Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												className={cn(categoryFilter !== 'all' && 'text-primary')}
											>
												<Layers className="h-4 w-4" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-40 p-2" align="end">
											<div className="space-y-1">
												<p className="px-2 py-1 text-xs font-medium text-muted-foreground">Category</p>
												{['all', 'weather', 'economics', 'sports'].map((cat) => (
													<button
														key={cat}
														type="button"
														onClick={() => {
															setCategoryFilter(cat);
															setCategoryOpen(false);
														}}
														className={cn(
															'w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent',
															categoryFilter === cat && 'bg-accent text-accent-foreground'
														)}
													>
														{cat === 'all' ? 'All Markets' : cat.charAt(0).toUpperCase() + cat.slice(1)}
													</button>
												))}
											</div>
										</PopoverContent>
									</Popover>

									<Popover open={sortOpen} onOpenChange={setSortOpen}>
										<PopoverTrigger asChild>
											<Button variant="ghost" size="sm">
												<ArrowDownAZ className="h-4 w-4" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-40 p-2" align="end">
											<div className="space-y-1">
												<p className="px-2 py-1 text-xs font-medium text-muted-foreground">Sort By</p>
												{[
													{ value: 'volume24h', label: 'Volume (24h)' },
													{ value: 'spread', label: 'Spread (Tight)' },
													{ value: 'openInterest', label: 'Open Interest' },
												].map((opt) => (
													<button
														key={opt.value}
														type="button"
														onClick={() => {
															setSortBy(opt.value as typeof sortBy);
															setSortOpen(false);
														}}
														className={cn(
															'w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent',
															sortBy === opt.value && 'bg-accent text-accent-foreground'
														)}
													>
														{opt.label}
													</button>
												))}
											</div>
										</PopoverContent>
									</Popover>

									<Popover open={volumeOpen} onOpenChange={setVolumeOpen}>
										<PopoverTrigger asChild>
											<Button variant="ghost" size="sm" className={cn(minVolume > 0 && 'text-primary')}>
												<BarChart3 className="h-4 w-4" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-40 p-2" align="end">
											<div className="space-y-1">
												<p className="px-2 py-1 text-xs font-medium text-muted-foreground">Min Volume</p>
												{[
													{ value: 0, label: 'Any' },
													{ value: 100, label: '100+' },
													{ value: 1000, label: '1,000+' },
													{ value: 10000, label: '10,000+' },
												].map((opt) => (
													<button
														key={opt.value}
														type="button"
														onClick={() => {
															setMinVolume(opt.value);
															setVolumeOpen(false);
														}}
														className={cn(
															'w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent',
															minVolume === opt.value && 'bg-accent text-accent-foreground'
														)}
													>
														{opt.label}
													</button>
												))}
											</div>
										</PopoverContent>
									</Popover>

									<Button
										variant="ghost"
										size="sm"
										onClick={() => fetchMarkets(categoryFilter, minVolume, dryRun)}
										disabled={isPending}
									>
										{isPending ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<RefreshCw className="h-4 w-4" />
										)}
									</Button>
								</div>
							</div>

							<div className="relative min-h-[300px] max-h-[300px] overflow-y-auto pr-1">
								{isPending && (
									<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
										<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
									</div>
								)}
								{filteredAndSortedMarkets.length > 0 ? (
									<div className="space-y-2">
										{filteredAndSortedMarkets.map((market) => (
											<button
												key={market.ticker}
												type="button"
												onClick={() => handleSelectMarket(market)}
												className={cn(
													'w-full rounded-md border p-3 text-left transition-colors hover:bg-accent',
													localConfig.marketTicker === market.ticker && 'border-primary bg-accent'
												)}
											>
												<div className="flex items-center justify-between">
													<span className="font-medium text-sm">{market.title}</span>
													<div className="flex items-center gap-2">
														<Badge variant="outline" className="font-mono text-xs">
															{market.spreadBps}bps
														</Badge>
														<Badge variant="secondary" className="font-mono text-xs">
															{formatPrice(market.yesPrice)}
														</Badge>
													</div>
												</div>
												<div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
													<span>{market.subtitle}</span>
													<span>·</span>
													<span className="capitalize">{market.category}</span>
												</div>
												<div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
													<span className="font-mono">{market.ticker}</span>
													<span>·</span>
													<span>24h: {market.volume24h.toLocaleString()}</span>
													<span>·</span>
													<span>OI: {market.openInterest.toLocaleString()}</span>
												</div>
											</button>
										))}
									</div>
								) : (
									<p className="py-2 text-center text-sm text-muted-foreground">No markets available</p>
								)}
							</div>
						</div>

						<div className="space-y-3">
							<Label htmlFor="marketTicker">Market Ticker</Label>
							<Input
								id="marketTicker"
								placeholder="Select above or enter manually"
								value={localConfig.marketTicker}
								onChange={(e) => setLocalConfig({ ...localConfig, marketTicker: e.target.value })}
								className={cn(localConfig.marketTicker && 'border-green-500')}
							/>
						</div>
					</div>

					<Separator />

					<div className="space-y-4">
						<h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
							Trading Strategy
						</h3>

						<div className="space-y-3">
							<div className="space-y-2">
								{availableStrategies.map((strategy) => (
									<button
										key={strategy}
										type="button"
										onClick={() => !isBotRunning && onStrategyChange(strategy)}
										disabled={isBotRunning}
										className={cn(
											'w-full rounded-md border p-3 text-left transition-colors',
											currentStrategy === strategy ? 'border-primary bg-accent' : 'hover:bg-accent',
											isBotRunning && 'cursor-not-allowed opacity-50'
										)}
									>
										<div className="flex items-center justify-between">
											<span className="font-medium text-sm capitalize">{strategy.replace('-', ' ')}</span>
											{currentStrategy === strategy && (
												<Badge variant="secondary" className="text-xs">
													Active
												</Badge>
											)}
										</div>
										<p className="mt-1 text-xs text-muted-foreground">{strategyDescriptions[strategy]}</p>
									</button>
								))}
							</div>
							{isBotRunning && <p className="text-xs text-muted-foreground">Stop the bot to change strategy</p>}
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
								<span className="font-mono text-sm tabular-nums text-muted-foreground">
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
