'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { getCurrentUser } from '@/lib/actions/auth'
import { UserHeaderSkeleton } from '@/components/ui/SkeletonLoaders'
import { toast } from 'sonner'

interface User {
    id: string
    firstName: string
    lastName: string
    email: string
}

interface AsyncUserHeaderProps {
    initialUser?: User | null
}

export default function AsyncUserHeader({ initialUser }: AsyncUserHeaderProps) {
    const { data: user, isLoading, error } = useAsyncData(
        async () => {
            const currentUser = await getCurrentUser()
            if (!currentUser) {
                throw new Error('User not found')
            }
            return currentUser
        },
        [],
        {
            initialData: initialUser,
            onError: (error) => {
                toast.error('Failed to load user information: ' + error.message)
            }
        }
    )

    if (isLoading) {
        return <UserHeaderSkeleton />
    }

    if (error || !user) {
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back!
                        </h1>
                        <p className="text-red-600 mt-1">
                            Failed to load user information
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {user.firstName}!
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Ready to create your next inspiring talk?
                    </p>
                </div>
                <div className="hidden sm:flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600">
                            {user.firstName.charAt(0).toUpperCase()}{user.lastName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}