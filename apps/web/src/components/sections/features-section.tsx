import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { features } from '@/lib/constants';

export function FeaturesSection() {
	return (
		<section id="features" className="py-24 bg-secondary/20">
			<div className="container mx-auto px-6">
				<div className="max-w-3xl mx-auto text-center mb-16">
					<h2 className="text-4xl md:text-4xl font-bold text-foreground mb-4">Everything you need to ship</h2>
					<p className="text-lg text-muted-foreground">
						Carefully selected tools and configurations to accelerate your development workflow
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
					{features.map((feature) => (
						<Card
							key={feature.title}
							className="border-border shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-200 bg-card flex flex-col h-full"
						>
							<CardHeader>
								<div className="w-12 h-12 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
									{feature.icon}
								</div>
								<CardTitle className="text-lg font-semibold text-card-foreground select-none">
									{feature.title}
								</CardTitle>
							</CardHeader>
							<CardContent className="grow">
								<CardDescription className="text-muted-foreground select-none">
									{feature.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
