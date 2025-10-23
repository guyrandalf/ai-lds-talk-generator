'use client'

import { withLazyLoading } from '@/components/ui/LazyLoader'
import { Skeleton } from '@/components/ui/skeleton'
import { GeneratedTalk } from '@/lib/actions/talks'

const TalkEditForm = withLazyLoading(
    () => import('@/components/TalkEditForm'),
    {
        fallback: (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
                <div className="flex justify-end space-x-3">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        )
    }
)

interface TalkEditClientProps {
    talk: GeneratedTalk
}

export default function TalkEditClient({ talk }: TalkEditClientProps) {
    return <TalkEditForm talk={talk} />
}