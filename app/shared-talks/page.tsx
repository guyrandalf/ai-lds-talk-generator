import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { withLazyLoading } from '@/components/ui/LazyLoader'
import { Skeleton } from '@/components/ui/skeleton'

const SharedTalksManager = withLazyLoading(
    () => import('@/components/SharedTalksManager').then(mod => ({ default: mod.SharedTalksManager })),
    {
        fallback: (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        )
    }
)

const MySharedTalks = withLazyLoading(
    () => import('@/components/MySharedTalks').then(mod => ({ default: mod.MySharedTalks })),
    {
        fallback: (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        )
    }
)

export default async function SharedTalksPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/auth/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shared Talks</h1>
                    <p className="text-gray-600 mt-2">
                        Manage talks shared with you and view your sharing history
                    </p>
                </div>

                {/* Tabs for different views */}
                <Tabs defaultValue="received" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="received">Received</TabsTrigger>
                        <TabsTrigger value="shared">My Shares</TabsTrigger>
                    </TabsList>

                    <TabsContent value="received" className="space-y-6">
                        <SharedTalksManager />
                    </TabsContent>

                    <TabsContent value="shared" className="space-y-6">
                        <MySharedTalks />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export const metadata = {
    title: 'Shared Talks - Pulpit Pal',
    description: 'Manage shared talks and collaboration',
}