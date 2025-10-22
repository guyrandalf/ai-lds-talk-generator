'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GeneratedTalk } from '@/lib/actions/talks'
import TalkManagementActions from './TalkManagementActions'

interface TalksListProps {
    talks: GeneratedTalk[]
}

export default function TalksList({ talks }: TalksListProps) {
    const [selectedTalk, setSelectedTalk] = useState<GeneratedTalk | null>(null)

    if (talks.length === 0) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No talks created yet</h3>
                    <p className="text-gray-500 mb-6">
                        Create your first talk to get started with personalized Church content.
                    </p>
                    <Link
                        href="/questionnaire"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create your first talk
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="divide-y divide-gray-100">
            {talks.map((talk) => (
                <div key={talk.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900 truncate">
                                    {talk.title}
                                </h4>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${talk.meetingType === 'sacrament'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-purple-100 text-purple-800'
                                    }`}>
                                    {talk.meetingType === 'sacrament' ? 'Sacrament Meeting' : 'Stake Conference'}
                                </span>
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {talk.duration} minutes
                                </div>
                                {talk.questionnaire?.topic && (
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        {talk.questionnaire.topic}
                                    </div>
                                )}
                                {talk.createdAt && (
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(talk.createdAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-600 text-sm line-clamp-2">
                                {talk.content.substring(0, 150)}...
                            </p>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                            <Link
                                href={`/talk/${talk.id}`}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View
                            </Link>

                            <button
                                onClick={() => setSelectedTalk(talk)}
                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                                Manage
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Management Modal */}
            {selectedTalk && (
                <TalkManagementActions
                    talk={selectedTalk}
                    onClose={() => setSelectedTalk(null)}
                />
            )}
        </div>
    )
}