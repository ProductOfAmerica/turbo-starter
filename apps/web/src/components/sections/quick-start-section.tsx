import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Code2, Container, Layers, Package, Rocket, Terminal } from 'lucide-react';
import { ClipboardButton } from '@/components/clipboard-button';
import { commands } from '@/lib/constants';

export function QuickStartSection() {
	return (
		<section id="quick-start" className="py-24">
			<div className="container mx-auto px-6">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-4xl font-bold text-foreground mb-4">Get up and running</h2>
						<p className="text-lg text-muted-foreground">
							Start building your next project in minutes, not hours
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8">
						<Card className="border-border bg-card">
							<CardHeader>
								<div className="flex items-center space-x-3 mb-2">
									<div className="w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
										<Terminal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
									</div>
									<CardTitle className="text-xl text-card-foreground">Installation</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
									<div className="text-foreground">
										${' '}
										<span className="text-blue-600 dark:text-blue-400">
											git clone https://github.com/ProductOfAmerica/turbo-starter.git
										</span>
									</div>
									<div className="text-foreground">
										$ <span className="text-blue-600 dark:text-blue-400">cd turbo-starter</span>
									</div>
									<div className="text-foreground">
										$ <span className="text-blue-600 dark:text-blue-400">pnpm install</span>
									</div>
									<div className="text-foreground">
										$ <span className="text-purple-600 dark:text-purple-400 font-semibold">pnpm dev</span>
									</div>
								</div>
								<p className="text-sm text-muted-foreground">
									Clone the repository and start developing immediately with hot reload
								</p>
							</CardContent>
						</Card>

						<Card className="border-border bg-card">
							<CardHeader>
								<div className="flex items-center space-x-3 mb-2">
									<div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg flex items-center justify-center">
										<Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
									</div>
									<CardTitle className="text-xl text-card-foreground">Project Structure</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="bg-muted rounded-lg p-4 font-mono text-sm text-muted-foreground">
									<div className="flex items-center space-x-2">
										<Code2 className="w-4 h-4 shrink-0" />
										<span className="shrink-0">apps/web</span>
										<span className="text-muted-foreground">→ Next.js application</span>
									</div>
									<div className="flex items-center space-x-2 mt-2">
										<Package className="w-4 h-4 shrink-0" />
										<span className="shrink-0">packages/ui</span>
										<span className="text-muted-foreground">→ Shared components</span>
									</div>
									<div className="flex items-center space-x-2 mt-2">
										<Container className="w-4 h-4 shrink-0" />
										<span className="shrink-0">docker-compose.yml</span>
										<span className="text-muted-foreground">→ Container setup</span>
									</div>
								</div>
								<p className="text-sm text-muted-foreground">
									Organized monorepo structure for scalable development
								</p>
							</CardContent>
						</Card>
					</div>

					<Card className="mt-8 border-border bg-linear-to-br from-muted/50 to-card">
						<CardHeader>
							<CardTitle className="text-xl text-card-foreground flex items-center space-x-2">
								<Rocket className="w-5 h-5" />
								<span>Available Commands</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid md:grid-cols-2 gap-4">
								{commands.map((item) => (
									<div
										key={item.cmd}
										className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3"
									>
										<code className="bg-background border border-border rounded px-3 py-1 text-sm font-mono text-blue-600 dark:text-blue-400 shrink-0 flex items-center justify-between">
											{item.cmd}
											<ClipboardButton cmd={item.cmd} />
										</code>
										<span className="text-sm text-muted-foreground">{item.desc}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
