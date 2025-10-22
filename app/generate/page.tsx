'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TalkQuestionnaire, { TalkQuestionnaireData } from '@/components/TalkQuestionnaire'
import TalkDisplayWrapper from '@/components/TalkDisplayWrapper'
import { generateTalk, GeneratedTalk } from '@/lib/actions/talks'
import { getCurrentUser } from '@/lib/actions/auth'

function GeneratePageContent() {
    const [currentStep, setCurrentStep] = useState<'questionnaire' | 'generating' | 'display'>('questionnaire')
    const [generatedTalk, setGeneratedTalk] = useState<GeneratedTalk | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialTopic = searchParams.get('topic') || ''

    // Check authentication status on component mount
    useEffect(() => {
        getCurrentUser().then(user => {
            setIsAuthenticated(!!user)
        })
    }, [])

    const handleQuestionnaireSubmit = async (data: TalkQuestionnaireData) => {
        setCurrentStep('generating')
        setError(null)

        try {
            const result = await generateTalk(data)

            if (result.success && result.talk) {
                setGeneratedTalk(result.talk)
                setCurrentStep('display')
            } else {
                setError(result.error || 'Failed to generate talk')
                setCurrentStep('questionnaire')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred')
            setCurrentStep('questionnaire')
        }
    }

    const handleSaveSuccess = (talkId: string) => {
        // Redirect to the saved talk page
        router.push(`/talk/${talkId}`)
    }

    const handleError = (errorMessage: string) => {
        setError(errorMessage)
    }

    const handleStartOver = () => {
        setCurrentStep('questionnaire')
        setGeneratedTalk(null)
        setError(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                        isLoading={false}
                        initialTopic={initialTopic}
                    />
                )}

                {currentStep === 'generating' && (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Talk</h2>
                            <p className="text-gray-600">
                                Our AI is crafting a personalized talk based on your preferences. This may take a moment...
                            </p>
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
            </div>
        </div>
    )
}

export default function GeneratePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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