'use client'

import { useEffect, useState } from 'react'

interface ProgressBarProps {
    progress: number // 0-100
    className?: string
    showPercentage?: boolean
    animated?: boolean
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
    size?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({
    progress,
    className = '',
    showPercentage = false,
    animated = true,
    color = 'blue',
    size = 'md'
}: ProgressBarProps) {
    const [displayProgress, setDisplayProgress] = useState(0)

    useEffect(() => {
        if (animated) {
            const timer = setTimeout(() => {
                setDisplayProgress(Math.min(Math.max(progress, 0), 100))
            }, 100)
            return () => clearTimeout(timer)
        } else {
            setDisplayProgress(Math.min(Math.max(progress, 0), 100))
        }
    }, [progress, animated])

    const getColorClasses = () => {
        switch (color) {
            case 'blue':
                return 'bg-blue-600 dark:bg-blue-500'
            case 'green':
                return 'bg-green-600 dark:bg-green-500'
            case 'yellow':
                return 'bg-yellow-600 dark:bg-yellow-500'
            case 'red':
                return 'bg-red-600 dark:bg-red-500'
            case 'purple':
                return 'bg-purple-600 dark:bg-purple-500'
            default:
                return 'bg-blue-600 dark:bg-blue-500'
        }
    }

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'h-1'
            case 'md':
                return 'h-2'
            case 'lg':
                return 'h-3'
            default:
                return 'h-2'
        }
    }

    return (
        <div className={`w-full ${className}`}>
            {showPercentage && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Progress
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(displayProgress)}%
                    </span>
                </div>
            )}

            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${getSizeClasses()}`}>
                <div
                    className={`${getSizeClasses()} ${getColorClasses()} transition-all duration-500 ease-out rounded-full`}
                    style={{ width: `${displayProgress}%` }}
                />
            </div>
        </div>
    )
}

// Specialized progress components
interface TalkGenerationProgressProps {
    stage: 'processing' | 'generating' | 'validating' | 'complete'
    progress: number
}

export function TalkGenerationProgress({ stage, progress }: TalkGenerationProgressProps) {
    const getStageText = () => {
        switch (stage) {
            case 'processing':
                return 'Processing your questionnaire...'
            case 'generating':
                return 'Generating your talk...'
            case 'validating':
                return 'Validating content...'
            case 'complete':
                return 'Complete!'
            default:
                return 'Processing...'
        }
    }

    const getStageColor = () => {
        switch (stage) {
            case 'processing':
                return 'blue'
            case 'generating':
                return 'purple'
            case 'validating':
                return 'yellow'
            case 'complete':
                return 'green'
            default:
                return 'blue'
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Creating Your Talk
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getStageText()}
                </p>
            </div>

            <ProgressBar
                progress={progress}
                color={getStageColor() as any}
                showPercentage={true}
                animated={true}
                size="lg"
            />

            <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    This may take a few moments...
                </p>
            </div>
        </div>
    )
}

interface StepProgressProps {
    steps: string[]
    currentStep: number
    completedSteps?: number[]
}

export function StepProgress({ steps, currentStep, completedSteps = [] }: StepProgressProps) {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${completedSteps.includes(index)
                                    ? 'bg-green-600 text-white'
                                    : index === currentStep
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                        >
                            {completedSteps.includes(index) ? '✓' : index + 1}
                        </div>

                        {index < steps.length - 1 && (
                            <div
                                className={`w-12 h-0.5 mx-2 transition-colors ${completedSteps.includes(index) || index < currentStep
                                        ? 'bg-green-600'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {steps[currentStep]}
                </p>
            </div>
        </div>
    )
}