import { Button } from '@repo/ui/components/button';
import { GitBranch, Globe } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
	return (
		<section className="py-24 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
			<div className="container mx-auto px-6 text-center">
				<div className="max-w-3xl mx-auto space-y-8">
					<h2 className="text-4xl md:text-4xl font-bold text-foreground">Ready to build something amazing?</h2>
					<p className="text-lg text-muted-foreground">
						Join developers who are shipping faster with our modern monorepo setup
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							size="lg"
							className="bg-foreground hover:bg-foreground/90 text-background px-8 w-full sm:w-auto"
							asChild
						>
							<Link href="https://github.com/ProductOfAmerica/turbo-starter" target="_blank">
								<GitBranch className="w-4 h-4 mr-2" />
								Clone Repository
							</Link>
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="border-border hover:bg-accent px-8 w-full sm:w-auto"
							asChild
						>
							<Link href="https://vercel.com/templates" target="_blank">
								<Globe className="w-4 h-4 mr-2" />
								Deploy to Vercel
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
