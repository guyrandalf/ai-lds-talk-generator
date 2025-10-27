'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteSavedTalk } from '@/lib/actions/talks'
import { GeneratedTalk } from '@/lib/types/talks/generation'
import { ShareTalkDialog } from './ShareTalkDialog'

interface TalkManagementActionsProps {
    talk: GeneratedTalk
    onClose: () => void
    onTalkDeleted?: () => void
}

export default function TalkManagementActions({ talk, onClose, onTalkDeleted }: TalkManagementActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleDelete = async () => {
        if (!talk.id) return

        setIsDeleting(true)
        setError(null)

        try {
            const result = await deleteSavedTalk(talk.id)

            if (result.success) {
                onClose()
                // Immediately refresh the talks list
                if (onTalkDeleted) {
                    onTalkDeleted()
                } else {
                    router.refresh() // Fallback for components that don't provide onTalkDeleted
                }
            } else {
                setError(result.error || 'Failed to delete talk')
            }
        } catch {
            setError('An unexpected error occurred while deleting the talk')
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const handleExport = async () => {
        if (!talk.id) return

        setIsExporting(true)
        setError(null)

        try {
            const response = await fetch('/api/export-talk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ talkId: talk.id }),
            })

            if (response.ok) {
                // Get the filename from the response headers
                const contentDisposition = response.headers.get('Content-Disposition')
                const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'talk.docx'

                // Create blob and download
                const blob = await response.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = filename
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)

                onClose()
            } else {
                const errorData = await response.json()
                setError(errorData.error || 'Failed to export talk')
            }
        } catch {
            setError('An unexpected error occurred while exporting the talk')
        } finally {
            setIsExporting(false)
        }
    }

    const handleEdit = () => {
        if (talk.id) {
            router.push(`/talk/${talk.id}/edit`)
        }
    }

    const handleView = () => {
        if (talk.id) {
            router.push(`/talk/${talk.id}`)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Manage Talk</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">{talk.title}</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400">
                        <div className="flex">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="ml-3 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm ? (
                    <div className="p-6">
                        <div className="text-center">
                            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete Talk</h4>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this talk? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </div>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Action Buttons */
                    <div className="p-6 space-y-3">
                        <button
                            onClick={handleView}
                            className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <div>
                                <p className="font-medium">View Talk</p>
                                <p className="text-sm text-gray-500">Read the full talk content</p>
                            </div>
                        </button>

                        <button
                            onClick={handleEdit}
                            className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <div>
                                <p className="font-medium">Edit Talk</p>
                                <p className="text-sm text-gray-500">Modify the talk content</p>
                            </div>
                        </button>

                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                                <p className="font-medium">
                                    {isExporting ? 'Exporting...' : 'Export to Word'}
                                </p>
                                <p className="text-sm text-gray-500">Download as .docx file</p>
                            </div>
                            {isExporting && (
                                <svg className="animate-spin ml-auto h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                        </button>

                        <ShareTalkDialog
                            talk={{
                                id: talk.id || '',
                                title: talk.title,
                                content: talk.content
                            }}
                            variant="inline"
                            onShareComplete={() => {
                                onClose()
                            }}
                        />

                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <div>
                                <p className="font-medium">Delete Talk</p>
                                <p className="text-sm text-red-400">Permanently remove this talk</p>
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}