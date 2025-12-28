import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { techStack } from '@/lib/constants';

export function HeroSection() {
	return (
		<section className="relative overflow-hidden">
			<div className="container mx-auto px-6 py-16 sm:py-20 md:py-24 lg:py-32">
				<div className="max-w-4xl mx-auto text-center space-y-8">
					<div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5">
						<Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
						<span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
							v2.2 - Now with <b>Next.js 16</b> and <b>Tailwind CSS V4</b>
						</span>
					</div>

					<div className="space-y-4">
						<h1 className="text-7xl sm:text-5xl md:text-7xl font-bold text-foreground tracking-tight">
							Build faster with
							<span className="bg-linear-to-r from-[#FF1E56] to-[#0196FF] bg-clip-text text-transparent">
								{' '}
								Turborepo
							</span>
						</h1>
						<p className="text-2xl sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
							A modern monorepo starter template that scales with your ambitions. Production-ready from day one.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
						<Button
							size="lg"
							className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 px-8 w-full sm:w-auto"
							asChild
						>
							<Link
								href="https://github.com/ProductOfAmerica/turbo-starter"
								target="_blank"
								rel="noopener noreferrer"
							>
								Get Started
								<ArrowRight className="w-4 h-4" />
							</Link>
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="border-border hover:bg-accent px-8 w-full sm:w-auto"
							asChild
						>
							<Link href="https://turbo.build/repo/docs" target="_blank" rel="noopener noreferrer">
								Read Documentation
							</Link>
						</Button>
					</div>

					<div className="flex flex-col gap-3 pt-8">
						<div className="flex flex-wrap justify-center gap-2">
							{techStack.slice(0, 4).map((tech) => (
								<Link key={tech.name} href={tech.url} target="_blank" rel="noopener noreferrer">
									<Badge
										className={`${tech.color} border-0 hover:scale-105 transition-transform duration-200 px-3 pt-1.5 pb-2 select-none will-change-transform font-medium flex items-center justify-center leading-none cursor-pointer`}
									>
										{tech.name}
									</Badge>
								</Link>
							))}
						</div>
						<div className="flex flex-wrap justify-center gap-2">
							{techStack.slice(4).map((tech) => (
								<Link key={tech.name} href={tech.url} target="_blank" rel="noopener noreferrer">
									<Badge
										className={`${tech.color} border-0 hover:scale-105 transition-transform duration-200 px-3 pt-1.5 pb-2 select-none will-change-transform font-medium flex items-center justify-center leading-none cursor-pointer`}
									>
										{tech.name}
									</Badge>
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />
		</section>
	);
}
