'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { getUserSavedTalks, GeneratedTalk } from '@/lib/actions/talks'
import TalksList from '@/components/TalksList'
import { TalkListSkeleton } from '@/components/ui/SkeletonLoaders'
import { toast } from 'sonner'

interface AsyncTalksListProps {
    initialTalks?: GeneratedTalk[]
}

export default function AsyncTalksList({ initialTalks = [] }: AsyncTalksListProps) {
    const { data: talks, isLoading, error, refetch } = useAsyncData(
        async () => {
            const result = await getUserSavedTalks()
            if (!result.success) {
                throw new Error(result.error || 'Failed to load talks')
            }
            return result.talks || []
        },
        [],
        {
            initialData: initialTalks,
            onError: (error) => {
                toast.error('Failed to load talks: ' + error.message)
            }
        }
    )

    if (isLoading) {
        return <TalkListSkeleton />
    }

    if (error) {
        return (
            <div className="p-6 text-center">
                <div className="text-red-600 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm">Failed to load talks</p>
                </div>
                <button
                    onClick={refetch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        )
    }

    return <TalksList talks={talks || []} />
}