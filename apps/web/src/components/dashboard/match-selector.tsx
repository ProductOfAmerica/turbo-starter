'use client';

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/select';
import { Play, Square } from 'lucide-react';
import { useState } from 'react';
import type { GameType } from '@/services/types';

interface MatchSelectorProps {
	isRunning: boolean;
	isDryRun: boolean;
	onStart: (gameType: GameType, matchId: string, marketId: string) => void;
	onStop: () => void;
}

export function MatchSelector({ isRunning, isDryRun, onStart, onStop }: MatchSelectorProps) {
	const [gameType, setGameType] = useState<GameType>('lol');
	const [matchId, setMatchId] = useState('');
	const [marketId, setMarketId] = useState('');

	const handleStart = () => {
		if (matchId.trim()) {
			onStart(gameType, matchId.trim(), marketId.trim());
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Match Configuration</CardTitle>
						<CardDescription>Select game and match to track</CardDescription>
					</div>
					{isDryRun && (
						<Badge variant="outline" className="border-yellow-500 text-yellow-500">
							DRY RUN MODE
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-4 md:grid-cols-3">
					<div className="space-y-2">
						<Label htmlFor="gameType">Game</Label>
						<Select value={gameType} onValueChange={(v) => setGameType(v as GameType)} disabled={isRunning}>
							<SelectTrigger id="gameType">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="lol">League of Legends</SelectItem>
								<SelectItem value="dota">Dota 2</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="matchId">Match ID</Label>
						<Input
							id="matchId"
							placeholder="Enter match ID"
							value={matchId}
							onChange={(e) => setMatchId(e.target.value)}
							disabled={isRunning}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="marketId">Market ID (optional)</Label>
						<Input
							id="marketId"
							placeholder="Polymarket condition ID"
							value={marketId}
							onChange={(e) => setMarketId(e.target.value)}
							disabled={isRunning}
						/>
					</div>
				</div>

				<div className="flex gap-2">
					{isRunning ? (
						<Button variant="destructive" onClick={onStop} className="w-full">
							<Square className="mr-2 h-4 w-4" />
							Stop Trading
						</Button>
					) : (
						<Button
							onClick={handleStart}
							disabled={!matchId.trim()}
							className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
						>
							<Play className="mr-2 h-4 w-4" />
							Start Trading
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
