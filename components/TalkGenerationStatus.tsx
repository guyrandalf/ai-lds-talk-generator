'use client'

import { useState, useEffect } from 'react'
import { TalkGenerationProgress, StepProgress } from '@/components/ui/ProgressBar'
import { CheckCircle, AlertCircle, Clock, Sparkles } from 'lucide-react'

export type GenerationStage = 'processing' | 'generating' | 'validating' | 'complete' | 'error'

interface TalkGenerationStatusProps {
 stage: GenerationStage
 progress: number
 error?: string
 estimatedTime?: number // in seconds
 onRetry?: () => void
}

export default function TalkGenerationStatus({
 stage,
 progress,
 error,
 estimatedTime,
 onRetry
}: TalkGenerationStatusProps) {
 const [elapsedTime, setElapsedTime] = useState(0)

 useEffect(() => {
 if (stage === 'complete' || stage === 'error') return

 const interval = setInterval(() => {
 setElapsedTime(prev => prev + 1)
 }, 1000)

 return () => clearInterval(interval)
 }, [stage])

 const getStageInfo = () => {
 switch (stage) {
 case 'processing':
 return {
 title: 'Processing Your Questionnaire',
 description: 'We\'re analyzing your preferences and preparing the AI prompt...',
 icon: <Clock className="w-8 h-8 text-blue-600" />,
 color: 'blue'
 }
 case 'generating':
 return {
 title: 'Generating Your Talk',
 description: 'Our AI is crafting a personalized talk based on your inputs...',
 icon: <Sparkles className="w-8 h-8 text-purple-600" />,
 color: 'purple'
 }
 case 'validating':
 return {
 title: 'Validating Content',
 description: 'Ensuring all sources are from official Church content...',
 icon: <CheckCircle className="w-8 h-8 text-yellow-600" />,
 color: 'yellow'
 }
 case 'complete':
 return {
 title: 'Talk Generated Successfully!',
 description: 'Your personalized talk is ready for review.',
 icon: <CheckCircle className="w-8 h-8 text-green-600" />,
 color: 'green'
 }
 case 'error':
 return {
 title: 'Generation Failed',
 description: error || 'An error occurred while generating your talk.',
 icon: <AlertCircle className="w-8 h-8 text-red-600" />,
 color: 'red'
 }
 default:
 return {
 title: 'Processing...',
 description: 'Please wait while we process your request.',
 icon: <Clock className="w-8 h-8 text-gray-600" />,
 color: 'gray'
 }
 }
 }

 const formatTime = (seconds: number) => {
 const mins = Math.floor(seconds / 60)
 const secs = seconds % 60
 return `${mins}:${secs.toString().padStart(2, '0')}`
 }

 const stageInfo = getStageInfo()

 const steps = [
 'Processing Questionnaire',
 'Generating Content',
 'Validating Sources',
 'Complete'
 ]

 const getCurrentStep = () => {
 switch (stage) {
 case 'processing':
 return 0
 case 'generating':
 return 1
 case 'validating':
 return 2
 case 'complete':
 return 3
 case 'error':
 return -1
 default:
 return 0
 }
 }

 const getCompletedSteps = () => {
 const currentStep = getCurrentStep()
 if (currentStep === -1) return [] // Error state
 if (stage === 'complete') return [0, 1, 2, 3]
 return Array.from({ length: currentStep }, (_, i) => i)
 }

 return (
 <div className="max-w-2xl mx-auto">
 <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 transition-colors">
 {/* Status Icon and Title */}
 <div className="text-center mb-8">
 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
 {stageInfo.icon}
 </div>
 <h2 className="text-2xl font-bold text-gray-900 mb-2">
 {stageInfo.title}
 </h2>
 <p className="text-gray-600">
 {stageInfo.description}
 </p>
 </div>

 {/* Progress Steps */}
 {stage !== 'error' && (
 <div className="mb-8">
 <StepProgress
 steps={steps}
 currentStep={getCurrentStep()}
 completedSteps={getCompletedSteps()}
 />
 </div>
 )}

 {/* Progress Bar */}
 {stage !== 'error' && stage !== 'complete' && (
 <div className="mb-6">
 <TalkGenerationProgress stage={stage} progress={progress} />
 </div>
 )}

 {/* Time Information */}
 <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
 <div>
 Elapsed: {formatTime(elapsedTime)}
 </div>
 {estimatedTime && stage !== 'complete' && stage !== 'error' && (
 <div>
 Est. remaining: {formatTime(Math.max(0, estimatedTime - elapsedTime))}
 </div>
 )}
 </div>

 {/* Error Actions */}
 {stage === 'error' && onRetry && (
 <div className="text-center">
 <button
 onClick={onRetry}
 className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
 >
 Try Again
 </button>
 </div>
 )}

 {/* Success Message */}
 {stage === 'complete' && (
 <div className="text-center">
 <div className="bg-green-50 border border-green-200 rounded-xl p-4">
 <p className="text-green-800 font-medium">
 Your talk has been generated successfully! You can now review, edit, and export it.
 </p>
 </div>
 </div>
 )}

 {/* Tips while waiting */}
 {(stage === 'processing' || stage === 'generating') && (
 <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
 <h4 className="text-sm font-semibold text-blue-800 mb-2">
 💡 Did you know?
 </h4>
 <p className="text-sm text-blue-700">
 {stage === 'processing'
 ? 'We validate all Gospel Library links to ensure they\'re from official Church sources.'
 : 'Our AI uses only content from churchofjesuschrist.org to maintain doctrinal accuracy.'
 }
 </p>
 </div>
 )}
 </div>
 </div>
 )
}