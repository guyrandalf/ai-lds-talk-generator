import { getCurrentUser } from '@/lib/actions/auth'
import { getSavedTalkById } from '@/lib/actions/talks'
import { redirect, notFound } from 'next/navigation'
import TalkEditClient from './TalkEditClient'


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

    if (!talkResult.success || !talkResult.data) {
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
                <TalkEditClient talk={talkResult.data} />
            </div>
        </div>
    )
}

export const metadata = {
    title: 'Edit Talk - Pulpit Pal',
    description: 'Edit your saved talk content and settings',
}