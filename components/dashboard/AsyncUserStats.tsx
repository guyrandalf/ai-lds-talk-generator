'use client'

import React from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getUserSavedTalks } from '@/lib/actions/talks'
import { DashboardStatsSkeleton } from '@/components/ui/SkeletonLoaders'
import { toast } from 'sonner'
import { GeneratedTalk } from '@/lib/types/talks/generation'
import GamifiedStats from './GamifiedStats'

interface AsyncUserStatsProps {
    // No props needed - always fetch fresh data
}

export default function AsyncUserStats() {
    const { data: talks, isLoading, error, refetch } = useAsyncData(
        async (): Promise<GeneratedTalk[]> => {
            const result = await getUserSavedTalks()
            if (!result.success) {
                throw new Error(result.error || 'Failed to load user talks')
            }

            return result.data || []
        },
        [], // Always fetch fresh data
        {
            onError: (error) => {
                toast.error('Failed to load statistics: ' + error.message)
            }
        }
    )

    // Listen for talks changes from other components
    React.useEffect(() => {
        const handleTalksChanged = () => {
            refetch()
        }

        window.addEventListener('talksChanged', handleTalksChanged)
        return () => window.removeEventListener('talksChanged', handleTalksChanged)
    }, [refetch])

    if (isLoading) {
        return <DashboardStatsSkeleton />
    }

    if (error) {
        return (
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
        )
    }

    return <GamifiedStats talks={talks || []} />
}