import { Activity, BarChart3, Bot, Gamepad2, Shield, Zap } from 'lucide-react';

export const features = [
	{
		icon: <Activity className="w-5 h-5" aria-hidden="true" />,
		title: 'Real-time Events',
		description: 'Live game event streaming from PandaScore and OpenDota APIs',
	},
	{
		icon: <BarChart3 className="w-5 h-5" aria-hidden="true" />,
		title: 'Bayesian Predictions',
		description: 'Dynamic probability updates based on kills, objectives, and map control',
	},
	{
		icon: <Bot className="w-5 h-5" aria-hidden="true" />,
		title: 'Auto Trading',
		description: 'Automatic order execution when edge threshold is detected',
	},
	{
		icon: <Gamepad2 className="w-5 h-5" aria-hidden="true" />,
		title: 'Multi-Game Support',
		description: 'Track League of Legends and Dota 2 professional matches',
	},
	{
		icon: <Zap className="w-5 h-5" aria-hidden="true" />,
		title: 'Live Dashboard',
		description: 'Real-time probability charts, trade logs, and market prices',
	},
	{
		icon: <Shield className="w-5 h-5" aria-hidden="true" />,
		title: 'Dry Run Mode',
		description: 'Test strategies safely without risking real funds',
	},
];

export const techStack = [
	{ name: 'Polymarket', color: 'bg-[#7C3AED] text-white', url: 'https://polymarket.com' },
	{ name: 'Next.js 16', color: 'bg-black text-white dark:bg-white dark:text-black', url: 'https://nextjs.org' },
	{ name: 'PandaScore', color: 'bg-[#FF6B35] text-white', url: 'https://pandascore.co' },
	{ name: 'OpenDota', color: 'bg-[#7C3AED] text-white', url: 'https://www.opendota.com' },
	{ name: 'TypeScript', color: 'bg-[#3178c6] text-white', url: 'https://www.typescriptlang.org' },
	{ name: 'Recharts', color: 'bg-[#22C55E] text-white', url: 'https://recharts.org' },
];

export const eventTypes = [
	{ type: 'kill', label: 'Champion Kill', game: 'lol' },
	{ type: 'dragon', label: 'Dragon', game: 'lol' },
	{ type: 'baron', label: 'Baron Nashor', game: 'lol' },
	{ type: 'tower', label: 'Tower', game: 'both' },
	{ type: 'inhibitor', label: 'Inhibitor/Barracks', game: 'both' },
	{ type: 'roshan', label: 'Roshan', game: 'dota' },
];

export const tradingConfig = {
	edgeThreshold: 0.05,
	defaultOrderSize: 10.0,
	pollInterval: 2000,
};
