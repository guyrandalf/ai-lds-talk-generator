import { TalkListSkeleton } from '@/components/ui/SkeletonLoaders'

export default function TalksLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-6 sm:px-6 lg:px-8 py-8">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="flex space-x-4">
                            <div className="h-10 bg-gray-200 rounded w-24"></div>
                            <div className="h-10 bg-gray-200 rounded w-28"></div>
                        </div>
                    </div>

                    {/* Search Skeleton */}
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>

                {/* Talks List Skeleton */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <TalkListSkeleton />
                </div>
            </div>
        </div>
    )
}