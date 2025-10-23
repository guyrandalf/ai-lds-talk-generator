'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { withLazyLoading } from '@/components/ui/LazyLoader'
import { Skeleton } from '@/components/ui/skeleton'

const SharedTalksManagerComponent = withLazyLoading(
    () => import('@/components/SharedTalksManager'),
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

const MySharedTalksComponent = withLazyLoading(
    () => import('@/components/MySharedTalks'),
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

export default function SharedTalksClient() {
    return (
        <Tabs defaultValue="received" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="received">Received</TabsTrigger>
                <TabsTrigger value="shared">My Shares</TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="space-y-6">
                <SharedTalksManagerComponent />
            </TabsContent>

            <TabsContent value="shared" className="space-y-6">
                <MySharedTalksComponent />
            </TabsContent>
        </Tabs>
    )
}