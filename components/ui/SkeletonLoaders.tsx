'use client'

import { Skeleton } from"@/components/ui/skeleton"

// Talk List Skeleton Loader
export function TalkListSkeleton() {
 return (
 <div className="divide-y divide-gray-100">
 {Array.from({ length: 3 }).map((_, index) => (
 <div key={index} className="p-6">
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <div className="flex items-center space-x-3 mb-2">
 <Skeleton className="h-6 w-48" />
 <Skeleton className="h-5 w-24 rounded-full" />
 </div>

 <div className="flex items-center space-x-4 mb-3">
 <Skeleton className="h-4 w-20" />
 <Skeleton className="h-4 w-16" />
 <Skeleton className="h-4 w-24" />
 </div>

 <Skeleton className="h-4 w-full mb-1" />
 <Skeleton className="h-4 w-3/4" />
 </div>

 <div className="flex items-center space-x-2 ml-4">
 <Skeleton className="h-8 w-16" />
 <Skeleton className="h-8 w-20" />
 </div>
 </div>
 </div>
 ))}
 </div>
 )
}

// Dashboard Stats Skeleton
export function DashboardStatsSkeleton() {
 return (
 <div className="space-y-4">
 {Array.from({ length: 2 }).map((_, index) => (
 <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
 <div className="flex items-center">
 <Skeleton className="w-12 h-12 rounded-xl" />
 <div className="ml-4">
 <Skeleton className="h-8 w-12 mb-1" />
 <Skeleton className="h-4 w-20" />
 </div>
 </div>
 </div>
 ))}
 </div>
 )
}

// User Header Skeleton
export function UserHeaderSkeleton() {
 return (
 <div className="mb-8">
 <div className="flex items-center justify-between">
 <div>
 <Skeleton className="h-9 w-64 mb-2" />
 <Skeleton className="h-5 w-48" />
 </div>
 <div className="hidden sm:flex items-center space-x-3">
 <Skeleton className="w-12 h-12 rounded-full" />
 </div>
 </div>
 </div>
 )
}

// Form Field Skeleton
export function FormFieldSkeleton({
 label = true,
 input = true,
 description = false
}: {
 label?: boolean
 input?: boolean
 description?: boolean
}) {
 return (
 <div className="space-y-2">
 {label && <Skeleton className="h-4 w-24" />}
 {input && <Skeleton className="h-12 w-full rounded-xl" />}
 {description && <Skeleton className="h-3 w-48" />}
 </div>
 )
}

// Form Section Skeleton
export function FormSectionSkeleton({
 title = true,
 fields = 2
}: {
 title?: boolean
 fields?: number
}) {
 return (
 <div className="bg-gray-50 rounded-xl p-6">
 {title && (
 <div className="mb-4">
 <Skeleton className="h-6 w-40" />
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {Array.from({ length: fields }).map((_, index) => (
 <FormFieldSkeleton key={index} />
 ))}
 </div>
 </div>
 )
}

// Talk Content Skeleton
export function TalkContentSkeleton() {
 return (
 <div className="space-y-6">
 {/* Title */}
 <div className="text-center">
 <Skeleton className="h-8 w-64 mx-auto mb-2" />
 <Skeleton className="h-4 w-32 mx-auto" />
 </div>

 {/* Content paragraphs */}
 <div className="space-y-4">
 {Array.from({ length: 6 }).map((_, index) => (
 <div key={index} className="space-y-2">
 <Skeleton className="h-4 w-full" />
 <Skeleton className="h-4 w-full" />
 <Skeleton className="h-4 w-3/4" />
 </div>
 ))}
 </div>
 </div>
 )
}

// Quick Actions Skeleton
export function QuickActionsSkeleton() {
 return (
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
 <div className="p-6 border-b border-gray-100">
 <Skeleton className="h-6 w-32" />
 </div>
 <div className="p-6 space-y-4">
 {Array.from({ length: 3 }).map((_, index) => (
 <div key={index} className="flex items-center p-4 rounded-xl">
 <Skeleton className="w-10 h-10 rounded-lg" />
 <div className="ml-4 flex-1">
 <Skeleton className="h-4 w-32 mb-1" />
 <Skeleton className="h-3 w-48" />
 </div>
 </div>
 ))}
 </div>
 </div>
 )
}

// Navigation Skeleton
export function NavigationSkeleton() {
 return (
 <div className="flex items-center justify-between p-4">
 <Skeleton className="h-8 w-32" />
 <div className="flex items-center space-x-4">
 <Skeleton className="h-8 w-20" />
 <Skeleton className="h-8 w-8 rounded-full" />
 </div>
 </div>
 )
}

// Card Skeleton
export function CardSkeleton({
 hasHeader = true,
 hasContent = true,
 contentLines = 3
}: {
 hasHeader?: boolean
 hasContent?: boolean
 contentLines?: number
}) {
 return (
 <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
 {hasHeader && (
 <div className="p-6 border-b border-gray-100">
 <Skeleton className="h-6 w-40" />
 </div>
 )}
 {hasContent && (
 <div className="p-6 space-y-3">
 {Array.from({ length: contentLines }).map((_, index) => (
 <Skeleton key={index} className="h-4 w-full" />
 ))}
 </div>
 )}
 </div>
 )
}

// Loading State Wrapper
export function LoadingStateWrapper({
 isLoading,
 skeleton,
 children
}: {
 isLoading: boolean
 skeleton: React.ReactNode
 children: React.ReactNode
}) {
 if (isLoading) {
 return <>{skeleton}</>
 }

 return <>{children}</>
}