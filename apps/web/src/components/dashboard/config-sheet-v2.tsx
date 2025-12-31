'use client';

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Sheet, SheetContent, SheetTitle } from '@repo/ui/components/sheet';
import { Slider } from '@repo/ui/components/slider';
import { Switch } from '@repo/ui/components/switch';
import { cn } from '@repo/ui/lib/utils';
import { BarChart3, ChevronRight, Loader2, RefreshCw, Zap } from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import type { StrategyName } from '@/services/strategies';
import type { Config, KalshiMarket } from '@/services/types';

interface ConfigSheetV2Props {
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

type TabId = 'market' | 'strategy' | 'parameters';

export function ConfigSheetV2({
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
}: ConfigSheetV2Props) {
	const [localConfig, setLocalConfig] = useState<Config>(config);
	const [markets, setMarkets] = useState<KalshiMarket[]>([]);
	const [isPending, startTransition] = useTransition();
	const [activeTab, setActiveTab] = useState<TabId>('market');
	const [sortBy, setSortBy] = useState<'volume24h' | 'spread' | 'openInterest'>('volume24h');

	const fetchMarkets = useCallback(async (isDryRun: boolean) => {
		try {
			const params = new URLSearchParams({ status: 'open', limit: '50' });
			params.set('mode', isDryRun ? 'demo' : 'prod');
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
			fetchMarkets(dryRun);
		}
	}, [dryRun, open, fetchMarkets]);

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

	const tabs: { id: TabId; label: string }[] = [
		{ id: 'market', label: 'Market' },
		{ id: 'strategy', label: 'Strategy' },
		{ id: 'parameters', label: 'Parameters' },
	];

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetContent
				className="w-[560px] overflow-hidden border-white/[0.06] bg-[#0F0F10] p-0 sm:w-[640px]"
				style={{ maxWidth: '100vw' }}
			>
				<SheetTitle className="sr-only">Configuration</SheetTitle>
				<div className="flex h-full flex-col">
					<div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
						<h2 className="text-[15px] font-semibold tracking-tight text-[#EEEFF1]">Configuration</h2>
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<span className="text-[12px] text-[#95A2B3]">{dryRun ? 'Demo' : 'Live'}</span>
								<Switch
									checked={dryRun}
									onCheckedChange={onDryRunChange}
									disabled={isBotRunning}
									className="data-[state=checked]:bg-yellow-500"
								/>
							</div>
							{dryRun && (
								<Badge className="border-0 bg-yellow-500/10 text-[11px] font-medium text-yellow-500">
									DEMO
								</Badge>
							)}
						</div>
					</div>

					<div className="flex flex-1 overflow-hidden">
						<nav className="flex w-[180px] shrink-0 flex-col gap-1 border-r border-white/[0.06] bg-[#0F0F10] p-3">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveTab(tab.id)}
									className={cn(
										'flex items-center justify-between rounded-[6px] px-3 py-2 text-[13px] font-medium transition-colors duration-[80ms] ease-out',
										activeTab === tab.id
											? 'bg-white/10 text-[#EEEFF1]'
											: 'text-white/70 hover:bg-white/[0.05] hover:text-[#EEEFF1]'
									)}
								>
									{tab.label}
									{activeTab === tab.id && <ChevronRight className="h-3.5 w-3.5 text-white/50" />}
								</button>
							))}
						</nav>

						<div className="flex-1 overflow-y-auto p-6">
							{activeTab === 'market' && (
								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="text-[13px] font-semibold text-[#EEEFF1]">Select Market</h3>
											<p className="mt-0.5 text-[12px] text-white/50">Choose a market to trade</p>
										</div>
										<div className="flex items-center gap-2">
											<div className="flex rounded-[6px] border border-white/10 p-0.5">
												{[
													{ value: 'volume24h', label: 'Vol' },
													{ value: 'spread', label: 'Sprd' },
													{ value: 'openInterest', label: 'OI' },
												].map((opt) => (
													<button
														key={opt.value}
														type="button"
														onClick={() => setSortBy(opt.value as typeof sortBy)}
														className={cn(
															'rounded-[4px] px-2 py-1 text-[11px] font-medium transition-colors duration-[80ms]',
															sortBy === opt.value
																? 'bg-white/10 text-[#EEEFF1]'
																: 'text-white/50 hover:text-white/70'
														)}
													>
														{opt.label}
													</button>
												))}
											</div>
											<button
												type="button"
												onClick={() => fetchMarkets(dryRun)}
												disabled={isPending}
												className="flex h-7 w-7 items-center justify-center rounded-[6px] text-white/50 transition-colors duration-[80ms] hover:bg-white/10 hover:text-[#EEEFF1]"
											>
												{isPending ? (
													<Loader2 className="h-3.5 w-3.5 animate-spin" />
												) : (
													<RefreshCw className="h-3.5 w-3.5" />
												)}
											</button>
										</div>
									</div>

									{localConfig.marketTicker && (
										<div className="rounded-[6px] border border-[#5E6AD2]/50 bg-[#5E6AD2]/10 p-3">
											<div className="flex items-center gap-2">
												<span className="text-[12px] font-medium text-[#5E6AD2]">Selected</span>
												<span className="font-mono text-[13px] text-[#EEEFF1]">
													{localConfig.marketTicker}
												</span>
											</div>
										</div>
									)}

									<div className="relative max-h-[400px] min-h-[300px] overflow-y-auto rounded-[6px] border border-white/[0.06] bg-[#151516]">
										{isPending && (
											<div className="absolute inset-0 z-10 flex items-center justify-center bg-[#151516]/80">
												<Loader2 className="h-5 w-5 animate-spin text-white/50" />
											</div>
										)}
										{filteredAndSortedMarkets.length > 0 ? (
											<div className="divide-y divide-white/[0.06]">
												{filteredAndSortedMarkets.map((market) => (
													<button
														key={market.ticker}
														type="button"
														onClick={() => handleSelectMarket(market)}
														className={cn(
															'w-full p-3 text-left transition-colors duration-[80ms]',
															localConfig.marketTicker === market.ticker
																? 'bg-[#5E6AD2]/10'
																: 'hover:bg-white/[0.02]'
														)}
													>
														<div className="flex items-start justify-between gap-3">
															<div className="min-w-0 flex-1">
																<p className="truncate text-[13px] font-medium text-[#EEEFF1]">
																	{market.title}
																</p>
																<p className="mt-0.5 truncate text-[12px] text-white/50">
																	{market.subtitle}
																</p>
															</div>
															<div className="flex shrink-0 items-center gap-2">
																<span className="rounded-[4px] bg-white/10 px-1.5 py-0.5 font-mono text-[11px] text-white/70">
																	{market.spreadBps}bps
																</span>
																<span className="font-mono text-[13px] tabular-nums text-[#EEEFF1]">
																	{formatPrice(market.yesPrice)}
																</span>
															</div>
														</div>
														<div className="mt-2 flex items-center gap-3 text-[11px] text-[#95A2B3]">
															<span className="font-mono">{market.ticker}</span>
															<span className="capitalize">{market.category}</span>
															<span className="flex items-center gap-1">
																<BarChart3 className="h-3 w-3" />
																{market.volume24h.toLocaleString()}
															</span>
														</div>
													</button>
												))}
											</div>
										) : (
											<div className="flex h-[200px] flex-col items-center justify-center">
												<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/30">
													<BarChart3 className="h-5 w-5" />
												</div>
												<p className="text-[13px] text-white/50">No markets available</p>
											</div>
										)}
									</div>
								</div>
							)}

							{activeTab === 'strategy' && (
								<div className="space-y-6">
									<div>
										<h3 className="text-[13px] font-semibold text-[#EEEFF1]">Trading Strategy</h3>
										<p className="mt-0.5 text-[12px] text-white/50">Select how the bot trades</p>
									</div>

									{isBotRunning && (
										<div className="rounded-[6px] border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
											<p className="text-[12px] text-yellow-500">Stop the bot to change strategy</p>
										</div>
									)}

									<div className="space-y-2">
										{availableStrategies.map((strategy) => (
											<button
												key={strategy}
												type="button"
												onClick={() => !isBotRunning && onStrategyChange(strategy)}
												disabled={isBotRunning}
												className={cn(
													'w-full rounded-[6px] border p-4 text-left transition-colors duration-[120ms]',
													currentStrategy === strategy
														? 'border-[#5E6AD2]/50 bg-[#5E6AD2]/10'
														: 'border-white/[0.06] bg-[#151516] hover:border-white/10 hover:bg-[#1A1A1B]',
													isBotRunning && 'cursor-not-allowed opacity-50'
												)}
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2">
														<Zap
															className={cn(
																'h-4 w-4',
																currentStrategy === strategy ? 'text-[#5E6AD2]' : 'text-white/50'
															)}
														/>
														<span className="text-[13px] font-medium capitalize text-[#EEEFF1]">
															{strategy.replace('-', ' ')}
														</span>
													</div>
													{currentStrategy === strategy && (
														<Badge className="border-0 bg-[#5E6AD2]/20 text-[11px] font-medium text-[#5E6AD2]">
															Active
														</Badge>
													)}
												</div>
												<p className="mt-2 text-[12px] text-white/50">{strategyDescriptions[strategy]}</p>
											</button>
										))}
									</div>
								</div>
							)}

							{activeTab === 'parameters' && (
								<div className="space-y-8">
									<div>
										<h3 className="text-[13px] font-semibold text-[#EEEFF1]">Trading Parameters</h3>
										<p className="mt-0.5 text-[12px] text-white/50">Fine-tune bot behavior</p>
									</div>

									<div className="space-y-6">
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<span className="text-[13px] font-medium text-[#EEEFF1]">Edge Threshold</span>
												<span className="rounded-[4px] bg-white/10 px-2 py-0.5 font-mono text-[13px] tabular-nums text-[#EEEFF1]">
													{localConfig.edgeThreshold.toFixed(1)}%
												</span>
											</div>
											<Slider
												value={[localConfig.edgeThreshold]}
												onValueChange={([v]) => setLocalConfig({ ...localConfig, edgeThreshold: v ?? 5 })}
												min={1}
												max={20}
												step={0.5}
												className="py-2"
											/>
											<p className="text-[12px] text-white/50">Minimum edge required to execute trades</p>
										</div>

										<div className="h-px bg-white/[0.06]" />

										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<span className="text-[13px] font-medium text-[#EEEFF1]">Order Size</span>
												<div className="flex items-center gap-1">
													<span className="text-[12px] text-white/50">$</span>
													<input
														type="number"
														min={1}
														max={1000}
														value={localConfig.orderSize}
														onChange={(e) =>
															setLocalConfig({ ...localConfig, orderSize: Number(e.target.value) })
														}
														className="w-20 rounded-[6px] border border-white/10 bg-[#0F0F10] px-2 py-1 text-right font-mono text-[13px] text-[#EEEFF1] placeholder:text-white/50 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
													/>
												</div>
											</div>
											<p className="text-[12px] text-white/50">Amount per trade in dollars</p>
										</div>

										<div className="h-px bg-white/[0.06]" />

										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<span className="text-[13px] font-medium text-[#EEEFF1]">Max Position</span>
												<div className="flex items-center gap-1">
													<span className="text-[12px] text-white/50">$</span>
													<input
														type="number"
														min={10}
														max={10000}
														value={localConfig.maxPosition}
														onChange={(e) =>
															setLocalConfig({ ...localConfig, maxPosition: Number(e.target.value) })
														}
														className="w-20 rounded-[6px] border border-white/10 bg-[#0F0F10] px-2 py-1 text-right font-mono text-[13px] text-[#EEEFF1] placeholder:text-white/50 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10"
													/>
												</div>
											</div>
											<p className="text-[12px] text-white/50">
												Maximum total exposure before pausing trades
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.02] px-6 py-4">
						<button
							type="button"
							onClick={handleReset}
							className="text-[13px] font-medium text-white/50 transition-colors duration-[80ms] hover:text-white/70"
						>
							Reset to defaults
						</button>
						<Button
							onClick={handleSave}
							className="h-9 bg-[#5E6AD2] px-4 text-[13px] font-medium text-white transition-colors duration-[120ms] hover:bg-[#6E7ADD] active:bg-[#4E5AC2]"
						>
							Apply Changes
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
