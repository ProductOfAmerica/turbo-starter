import { Container, Package, Palette, Rocket, Sparkles, Zap } from 'lucide-react';

export const features = [
	{
		icon: <Zap className="w-5 h-5" aria-hidden="true" />,
		title: 'Lightning Fast',
		description: 'Optimized builds with intelligent caching and parallel execution',
	},
	{
		icon: <Palette className="w-5 h-5" aria-hidden="true" />,
		title: 'Modern UI',
		description: 'Pre-configured Shadcn UI components with Tailwind CSS',
	},
	{
		icon: <Rocket className="w-5 h-5" aria-hidden="true" />,
		title: 'Production Ready',
		description: 'Next.js 16 with Turbopack for optimal performance',
	},
	{
		icon: <Sparkles className="w-5 h-5" aria-hidden="true" />,
		title: 'Developer Experience',
		description: 'Biome.js for fast, unified linting and formatting',
	},
	{
		icon: <Container className="w-5 h-5" aria-hidden="true" />,
		title: 'Containerized',
		description: 'Docker Compose setup for consistent development',
	},
	{
		icon: <Package className="w-5 h-5" aria-hidden="true" />,
		title: 'Monorepo Structure',
		description: 'Efficient workspace management with pnpm',
	},
];

export const techStack = [
	{ name: 'Next.js 16', color: 'bg-black text-white dark:bg-white dark:text-black', url: 'https://nextjs.org' },
	{ name: 'Turborepo', color: 'bg-linear-to-r from-[#FF1E56] to-[#0196FF] text-white', url: 'https://turbo.build' },
	{
		name: 'Shadcn UI',
		color: 'bg-[#0a0a0a] text-white dark:bg-zinc-100 dark:text-[#0a0a0a]',
		url: 'https://ui.shadcn.com',
	},
	{
		name: 'Tailwind CSS',
		color: 'bg-[#38bdf8] text-black',
		url: 'https://tailwindcss.com',
	},
	{ name: 'Biome.js', color: 'bg-[#60a5fa] text-black', url: 'https://biomejs.dev' },
	{ name: 'TypeScript', color: 'bg-[#3178c6] text-white', url: 'https://www.typescriptlang.org' },
	{ name: 'Docker', color: 'bg-[#1d63ed] text-white', url: 'https://www.docker.com' },
	{ name: 'pnpm', color: 'bg-[#f69220] text-black', url: 'https://pnpm.io' },
];

export const commands = [
	{ cmd: 'pnpm build', desc: 'Build all packages and apps' },
	{ cmd: 'pnpm lint', desc: 'Check code quality across the monorepo' },
	{ cmd: 'pnpm format-write', desc: 'Auto-format all code with Biome' },
	{ cmd: 'pnpm docker', desc: 'Run the entire stack with Docker' },
];
