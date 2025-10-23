import { getCurrentUser } from '@/lib/actions/auth'
import { getSavedTalkById } from '@/lib/actions/talks'
import { withLazyLoading } from '@/components/ui/LazyLoader'
import { Skeleton } from '@/components/ui/skeleton'

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
import { redirect, notFound } from 'next/navigation'


interface EditTalkPageProps {
    params: {
        id: string
    }
}

export default async function EditTalkPage({ params }: EditTalkPageProps) {
    const user = await getCurrentUser()
    const { id } = await params

    if (!user) {
        redirect('/auth/login')
    }

    // Get the talk
    const talkResult = await getSavedTalkById(id)

    if (!talkResult.success || !talkResult.talk) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-6 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit Talk</h1>
                            <p className="text-gray-600 mt-1">
                                Make changes to your talk content and settings
                            </p>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <TalkEditForm talk={talkResult.talk} />
            </div>
        </div>
    )
}

export const metadata = {
    title: 'Edit Talk - Pulpit Pal',
    description: 'Edit your saved talk content and settings',
}