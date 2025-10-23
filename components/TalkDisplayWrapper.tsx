'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import TalkDisplay from './TalkDisplay'
import { GeneratedTalk, saveTalkToDatabase } from '@/lib/actions/talks'

interface TalkDisplayWrapperProps {
    talk: GeneratedTalk
    isAuthenticated?: boolean
    showManagementActions?: boolean
    onSaveSuccess?: (talkId: string) => void
    onError?: (error: string) => void
    className?: string
}

export default function TalkDisplayWrapper({
    talk,
    isAuthenticated = false,
    showManagementActions = false,
    onSaveSuccess,
    onError,
    className = ''
}: TalkDisplayWrapperProps) {
    const [isExporting, setIsExporting] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    const handleExport = async () => {
        if (!talk.id) {
            const errorMessage = 'Talk must be saved before exporting'
            toast.error(errorMessage)
            onError?.(errorMessage)
            return
        }

        setIsExporting(true)

        // Show loading toast
        const loadingToast = toast.loading('Preparing your talk for download...', {
            description: 'Generating Word document with your talk content.'
        })

        try {
            const response = await fetch('/api/export-talk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ talkId: talk.id }),
            })

            // Dismiss loading toast
            toast.dismiss(loadingToast)

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

                // Show success toast
                toast.success('Talk exported successfully!', {
                    description: `Your talk has been downloaded as ${filename}`,
                    duration: 4000
                })
            } else {
                const errorData = await response.json()
                const errorMessage = errorData.error || 'Export failed'
                toast.error('Failed to export talk', {
                    description: errorMessage
                })
                onError?.(errorMessage)
            }
        } catch (error) {
            // Dismiss loading toast
            toast.dismiss(loadingToast)

            const errorMessage = error instanceof Error ? error.message : 'Export failed'
            toast.error('Failed to export talk', {
                description: errorMessage
            })
            onError?.(errorMessage)
        } finally {
            setIsExporting(false)
        }
    }

    const handleSave = async () => {
        if (!isAuthenticated) {
            const errorMessage = 'You must be logged in to save talks'
            toast.error(errorMessage)
            onError?.(errorMessage)
            return
        }

        setIsSaving(true)

        // Show loading toast
        const loadingToast = toast.loading('Saving your talk...', {
            description: 'Please wait while we save your talk to your account.'
        })

        try {
            const result = await saveTalkToDatabase(talk)

            // Dismiss loading toast
            toast.dismiss(loadingToast)

            if (result.success && result.talkId) {
                // Show success toast
                toast.success('Talk saved successfully!', {
                    description: 'Your talk has been saved to your account and you can access it from your dashboard.',
                    duration: 4000
                })
                onSaveSuccess?.(result.talkId)
            } else {
                const errorMessage = result.error || 'Failed to save talk'
                toast.error('Failed to save talk', {
                    description: errorMessage
                })
                onError?.(errorMessage)
            }
        } catch (error) {
            // Dismiss loading toast
            toast.dismiss(loadingToast)

            const errorMessage = error instanceof Error ? error.message : 'Failed to save talk'
            toast.error('Failed to save talk', {
                description: errorMessage
            })
            onError?.(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = () => {
        if (talk.id) {
            router.push(`/talk/${talk.id}/edit`)
        }
    }

    return (
        <div className={className}>
            {/* Navigation for saved talks */}
            {showManagementActions && talk.id && (
                <div className="mb-6">
                    <nav className="flex items-center space-x-4 text-sm">
                        <Link
                            href="/dashboard"
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0M8 5a2 2 0 012-2h2a2 2 0 012 2v0M8 5h8" />
                            </svg>
                            Dashboard
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium">View Talk</span>
                    </nav>
                </div>
            )}

            <TalkDisplay
                talk={talk}
                onExport={handleExport}
                onSave={!talk.id && isAuthenticated ? handleSave : undefined}
                onEdit={showManagementActions && talk.id ? handleEdit : undefined}
                isAuthenticated={isAuthenticated}
                isExporting={isExporting}
                isSaving={isSaving}
                className=""
            />
        </div>
    )
}