import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/actions/auth'
import { getSavedTalkById } from '@/lib/actions/talks'
import TalkDisplayWrapper from '@/components/TalkDisplayWrapper'

interface TalkPageProps {
    params: Promise<{ id: string }>
}

export default async function TalkPage({ params }: TalkPageProps) {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Get the saved talk
    const result = await getSavedTalkById(id)

    if (!result.success || !result.talk) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <TalkDisplayWrapper
                    talk={result.talk}
                    isAuthenticated={true}
                    showManagementActions={true}
                    className="mb-8"
                />
            </div>
        </div>
    )
}