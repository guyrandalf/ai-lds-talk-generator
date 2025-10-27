import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AsyncTalksList from '@/components/dashboard/AsyncTalksList'
import AsyncUserStats from '@/components/dashboard/AsyncUserStats'
import AsyncUserHeader from '@/components/dashboard/AsyncUserHeader'
import { AsyncErrorBoundary } from '@/components/ui/AsyncErrorBoundary'
import { getUserRecentTalks } from '@/lib/actions/talks'

export default async function DashboardPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Get initial data for SSR, but components will load independently
    const talksResult = await getUserRecentTalks(3) // Only get 3 recent talks for dashboard
    const initialTalks = talksResult.success ? talksResult.data || [] : []

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <AsyncErrorBoundary>
                    <AsyncUserHeader initialUser={user} />
                </AsyncErrorBoundary>

                {/* Main Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Generate New Talk */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Generate New Talk</h2>
                                    <p className="text-blue-100 mb-6">
                                        Create a personalized talk using official Church content
                                    </p>
                                    <Link
                                        href="/generate"
                                        className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Start Creating
                                        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                </div>
                                <div className="hidden sm:block">
                                    <svg className="w-24 h-24 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Recent Talks */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">My Recent Talks</h3>
                                    <Link
                                        href="/talks"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View All →
                                    </Link>
                                </div>
                            </div>
                            <AsyncErrorBoundary>
                                <AsyncTalksList initialTalks={initialTalks} limit={3} />
                            </AsyncErrorBoundary>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Gamified Stats */}
                        <AsyncErrorBoundary>
                            <AsyncUserStats />
                        </AsyncErrorBoundary>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const metadata = {
    title: 'Dashboard - Pulpit Pal',
    description: 'Manage your talks and account settings',
}