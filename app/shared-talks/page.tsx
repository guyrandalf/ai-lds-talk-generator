import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import SharedTalksClient from './SharedTalksClient'

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
                <SharedTalksClient />
            </div>
        </div>
    )
}

export const metadata = {
    title: 'Shared Talks - Pulpit Pal',
    description: 'Manage shared talks and collaboration',
}