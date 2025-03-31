import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Dashboard | TextHaven',
	description: 'Manage your texts at dashboard',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
