'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GeneratedTalk, updateSavedTalk } from '@/lib/actions/talks'

interface TalkEditFormProps {
    talk: GeneratedTalk
}

export default function TalkEditForm({ talk }: TalkEditFormProps) {
    const [title, setTitle] = useState(talk.title)
    const [content, setContent] = useState(talk.content)
    const [duration, setDuration] = useState(talk.duration)
    const [meetingType, setMeetingType] = useState(talk.meetingType)
    const [topic, setTopic] = useState(talk.questionnaire?.topic || '')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        if (!talk.id) return

        setIsSaving(true)
        setError(null)
        setSuccess(false)

        try {
            const updates: Partial<GeneratedTalk> = {
                title,
                content,
                duration,
                meetingType,
                questionnaire: {
                    ...talk.questionnaire,
                    topic,
                    duration,
                    meetingType: meetingType as 'sacrament' | 'stake_conference'
                }
            }

            const result = await updateSavedTalk(talk.id, updates)

            if (result.success) {
                setSuccess(true)
                setTimeout(() => {
                    router.push(`/talk/${talk.id}`)
                }, 1500)
            } else {
                setError(result.error || 'Failed to save changes')
            }
        } catch (err) {
            setError('An unexpected error occurred while saving')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        router.push(`/talk/${talk.id}`)
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* Success Message */}
            {success && (
                <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-t-2xl">
                    <div className="flex">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="ml-3 text-sm text-green-700">
                            Talk saved successfully! Redirecting to view...
                        </p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-t-2xl">
                    <div className="flex">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="ml-3 text-sm text-red-700">{error}</p>
                    </div>
                </div>
            )}

            <div className="p-8">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Talk Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter talk title"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                                Topic
                            </label>
                            <input
                                type="text"
                                id="topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Talk topic"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                Duration (minutes)
                            </label>
                            <input
                                type="number"
                                id="duration"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                                min="5"
                                max="60"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700 mb-2">
                                Meeting Type
                            </label>
                            <select
                                id="meetingType"
                                value={meetingType}
                                onChange={(e) => setMeetingType(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="sacrament">Sacrament Meeting</option>
                                <option value="stake_conference">Stake Conference</option>
                            </select>
                        </div>
                    </div>

                    {/* Talk Content */}
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                            Talk Content
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={20}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                            placeholder="Enter your talk content here..."
                            required
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            Current word count: {content.split(/\s+/).filter(word => word.length > 0).length} words
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <Link
                                href="/dashboard"
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Back to Dashboard
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving || !title.trim() || !content.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </div>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}