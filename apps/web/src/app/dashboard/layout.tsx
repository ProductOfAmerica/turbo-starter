import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Dashboard | Esports Trading Bot',
	description: 'Real-time esports trading dashboard',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
