'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { getUserSavedTalks } from '@/lib/actions/talks'
import { DashboardStatsSkeleton } from '@/components/ui/SkeletonLoaders'
import { toast } from 'sonner'
import { UserStats } from '@/lib/types/components/common'

export default function AsyncUserStats() {
    const { data: stats, isLoading, error } = useAsyncData(
        async (): Promise<UserStats> => {
            const result = await getUserSavedTalks()
            if (!result.success) {
                throw new Error(result.error || 'Failed to load user stats')
            }

            const talks = result.data || []
            return {
                totalTalks: talks.length,
                availableForExport: talks.length // All saved talks are available for export
            }
        },
        [],
        {
            onError: (error) => {
                toast.error('Failed to load statistics: ' + error.message)
            }
        }
    )

    if (isLoading) {
        return <DashboardStatsSkeleton />
    }

    if (error || !stats) {
        return (
            <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-red-600">Failed to load stats</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{stats.totalTalks}</p>
                        <p className="text-gray-600 text-sm">Saved Talks</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="ml-4">
                        <p className="text-2xl font-bold text-gray-900">{stats.availableForExport}</p>
                        <p className="text-gray-600 text-sm">Available for Export</p>
                    </div>
                </div>
            </div>
        </div>
    )
}