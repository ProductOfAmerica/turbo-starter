import { Navbar } from '@/components/navbar';
import { CTASection, FeaturesSection, Footer, HeroSection, QuickStartSection } from '@/components/sections';

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			<div className="fixed inset-0 -z-10">
				<div className="absolute inset-0 bg-linear-to-br from-blue-50 via-background to-indigo-50 opacity-70 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20" />
				<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20" />
				<div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-20" />
			</div>
			<Navbar />
			<HeroSection />
			<FeaturesSection />
			<QuickStartSection />
			<CTASection />
			<Footer />
		</div>
	);
}
