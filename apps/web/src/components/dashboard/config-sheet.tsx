'use client';

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Separator } from '@repo/ui/components/separator';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@repo/ui/components/sheet';
import { Slider } from '@repo/ui/components/slider';
import { cn } from '@repo/ui/lib/utils';
import { ArrowDownAZ, Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import type { Config, KalshiMarket } from '@/services/types';

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
	marketTicker: '',
	edgeThreshold: 5,
	orderSize: 10,
	maxPosition: 100,
};

export function ConfigSheet({ open, onOpenChange, config, onSave }: ConfigSheetProps) {
	const [localConfig, setLocalConfig] = useState<Config>(config);
	const [markets, setMarkets] = useState<KalshiMarket[]>([]);
	const [isPending, startTransition] = useTransition();
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [sortBy, setSortBy] = useState<'volume24h' | 'spread' | 'openInterest'>('volume24h');
	const [minVolume, setMinVolume] = useState<number>(0);
	const [apiStatuses] = useState<ApiStatus[]>([{ name: 'Kalshi', status: 'connected' }]);

	const fetchMarkets = useCallback(async (category: string) => {
		try {
			const params = new URLSearchParams({ status: 'open', limit: '50' });
			if (category !== 'all') {
				params.set('category', category);
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
			fetchMarkets(categoryFilter);
		}
	}, [categoryFilter, open, fetchMarkets]);

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

	const filteredAndSortedMarkets = markets
		.filter((m) => m.volume24h >= minVolume)
		.sort((a, b) => {
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
					<div className="space-y-4">
						<h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
							Market Selection
						</h3>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label>Category</Label>
								<Select value={categoryFilter} onValueChange={setCategoryFilter}>
									<SelectTrigger className="w-[140px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Markets</SelectItem>
										<SelectItem value="weather">Weather</SelectItem>
										<SelectItem value="economics">Economic Data</SelectItem>
										<SelectItem value="sports">Sports Totals</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center justify-between">
								<Label>Sort By</Label>
								<Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
									<SelectTrigger className="w-[140px]">
										<ArrowDownAZ className="mr-2 h-4 w-4" />
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="volume24h">Volume (24h)</SelectItem>
										<SelectItem value="spread">Spread (Tight)</SelectItem>
										<SelectItem value="openInterest">Open Interest</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center justify-between">
								<Label>Min Volume (24h)</Label>
								<Select value={String(minVolume)} onValueChange={(v) => setMinVolume(Number(v))}>
									<SelectTrigger className="w-[140px]">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="0">Any</SelectItem>
										<SelectItem value="100">100+</SelectItem>
										<SelectItem value="1000">1,000+</SelectItem>
										<SelectItem value="10000">10,000+</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<Label>Available Markets</Label>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => fetchMarkets(categoryFilter)}
									disabled={isPending}
								>
									{isPending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<RefreshCw className="h-4 w-4" />
									)}
								</Button>
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
												api.status === 'checking' && 'animate-pulse bg-yellow-500'
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
