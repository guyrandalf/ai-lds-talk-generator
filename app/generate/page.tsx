'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import type { TalkQuestionnaire } from '@/lib/types/talks/generation'
import TalkDisplayWrapper from '@/components/TalkDisplayWrapper'
import { TalkGenerationBreadcrumb } from '@/components/Breadcrumb'
import UnsavedChangesDialog from '@/components/UnsavedChangesDialog'
import { TalkGenerationProgress } from '@/components/ui/ProgressBar'
import { withLazyLoading } from '@/components/ui/LazyLoader'
import { Skeleton } from '@/components/ui/skeleton'

const TalkQuestionnaire = withLazyLoading(
    () => import('@/components/TalkQuestionnaire'),
    {
        fallback: (
            <div className="space-y-8">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )
    }
)
import { useNavigationGuard } from '@/hooks/useNavigationGuard'
import { useGuardedNavigation } from '@/hooks/useGuardedNavigation'
import { generateTalk } from '@/lib/actions/talks'
import type { GeneratedTalk } from '@/lib/types/talks/generation'
import { getCurrentUser } from '@/lib/actions/auth'

function GeneratePageContent() {
    const [currentStep, setCurrentStep] = useState<'questionnaire' | 'generating' | 'display'>('questionnaire')
    const [generatedTalk, setGeneratedTalk] = useState<GeneratedTalk | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [generationProgress, setGenerationProgress] = useState(0)
    const [generationStage, setGenerationStage] = useState<'processing' | 'generating' | 'validating' | 'complete'>('processing')
    const searchParams = useSearchParams()
    const initialTopic = searchParams.get('topic') || ''

    // Navigation guard for unsaved talks
    const navigationGuard = useNavigationGuard({
        enabled: true,
        warningMessage: 'You have a generated talk that hasn\'t been saved. Are you sure you want to leave? Your talk will be lost.'
    })

    // Use guarded navigation that respects the navigation guard
    const guardedRouter = useGuardedNavigation(navigationGuard)

    // Check authentication status on component mount
    useEffect(() => {
        getCurrentUser().then(user => {
            setIsAuthenticated(!!user)
        })
    }, [])

    // Update navigation guard based on talk state
    useEffect(() => {
        const hasUnsavedTalk = currentStep === 'display' && generatedTalk && !generatedTalk.id
        navigationGuard.setUnsavedChanges(!!hasUnsavedTalk)
    }, [currentStep, generatedTalk, navigationGuard.setUnsavedChanges])

    const handleQuestionnaireSubmit = async (data: TalkQuestionnaire) => {
        setCurrentStep('generating')
        setError(null)
        setGenerationProgress(0)
        setGenerationStage('processing')

        // Show loading toast
        const loadingToast = toast.loading('Generating your talk...', {
            description: 'Our AI is crafting a personalized talk based on your preferences. This may take a moment.'
        })

        // Simulate progress updates
        const progressInterval = setInterval(() => {
            setGenerationProgress(prev => {
                if (prev < 90) {
                    return prev + Math.random() * 15
                }
                return prev
            })
        }, 500)

        // Update stages
        setTimeout(() => setGenerationStage('generating'), 1000)
        setTimeout(() => setGenerationStage('validating'), 3000)

        try {
            const result = await generateTalk(data)

            // Clear progress interval
            clearInterval(progressInterval)
            setGenerationProgress(100)
            setGenerationStage('complete')

            // Dismiss loading toast
            toast.dismiss(loadingToast)

            if (result.success && result.data) {
                setGeneratedTalk(result.data)

                // Small delay to show completion
                setTimeout(() => {
                    setCurrentStep('display')
                }, 500)

                // Show success toast
                toast.success('Talk generated successfully!', {
                    description: 'Your personalized talk is ready for review. You can save it to your account or export it to Word.',
                    duration: 5000
                })
            } else {
                const errorMessage = result.error || 'Failed to generate talk'
                setError(errorMessage)
                setCurrentStep('questionnaire')
                setGenerationStage('processing')

                // Show error toast
                toast.error('Failed to generate talk', {
                    description: errorMessage
                })
            }
        } catch (err) {
            // Clear progress interval
            clearInterval(progressInterval)

            // Dismiss loading toast
            toast.dismiss(loadingToast)

            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
            setError(errorMessage)
            setCurrentStep('questionnaire')
            setGenerationStage('processing')

            // Show error toast
            toast.error('Failed to generate talk', {
                description: errorMessage
            })
        }
    }

    const handleSaveSuccess = (talkId: string) => {
        // Clear unsaved changes flag since talk is now saved
        navigationGuard.setUnsavedChanges(false)

        // Update the generated talk with the ID
        if (generatedTalk) {
            setGeneratedTalk({ ...generatedTalk, id: talkId })
        }

        // Redirect to dashboard after successful save
        setTimeout(() => {
            guardedRouter.push('/dashboard')
        }, 1500) // Small delay to let the success toast show
    }

    const handleError = (errorMessage: string) => {
        setError(errorMessage)
    }

    const handleStartOver = () => {
        // Clear unsaved changes flag
        navigationGuard.setUnsavedChanges(false)

        setCurrentStep('questionnaire')
        setGeneratedTalk(null)
        setError(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
            <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8">
                {/* Breadcrumb Navigation */}
                <TalkGenerationBreadcrumb currentStep={currentStep} />
                {/* Error Display */}
                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step Content */}
                {currentStep === 'questionnaire' && (
                    <TalkQuestionnaire
                        onSubmit={handleQuestionnaireSubmit}
                        initialTopic={initialTopic}
                    />
                )}

                {currentStep === 'generating' && (
                    <div className="flex items-center justify-center py-16">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full mx-4">
                            <TalkGenerationProgress
                                stage={generationStage}
                                progress={generationProgress}
                            />
                        </div>
                    </div>
                )}

                {currentStep === 'display' && generatedTalk && (
                    <div>
                        {/* Navigation */}
                        <div className="mb-8">
                            <button
                                onClick={handleStartOver}
                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Generate Another Talk
                            </button>
                        </div>

                        {/* Talk Display */}
                        <TalkDisplayWrapper
                            talk={generatedTalk}
                            isAuthenticated={isAuthenticated}
                            onSaveSuccess={handleSaveSuccess}
                            onError={handleError}
                        />
                    </div>
                )}

                {/* Unsaved Changes Dialog */}
                <UnsavedChangesDialog
                    open={navigationGuard.showWarning}
                    onOpenChange={navigationGuard.hideUnsavedWarning}
                    title="Unsaved Talk"
                    message={navigationGuard.warningMessage}
                    confirmText="Leave without saving"
                    cancelText="Stay and continue"
                    onConfirm={navigationGuard.confirmNavigation}
                    onCancel={navigationGuard.cancelNavigation}
                />
            </div>
        </div>
    )
}

export default function GeneratePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
                <div className="max-w-6xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
                    </div>
                </div>
            </div>
        }>
            <GeneratePageContent />
        </Suspense>
    )
}