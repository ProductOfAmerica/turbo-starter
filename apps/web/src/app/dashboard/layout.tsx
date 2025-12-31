import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Dashboard | Kalshi Trading Bot',
	description: 'Real-time Kalshi prediction market trading dashboard',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
