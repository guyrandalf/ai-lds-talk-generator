'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    text?: string
}

export default function LoadingSpinner({
    size = 'md',
    className = '',
    text
}: LoadingSpinnerProps) {
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'w-4 h-4'
            case 'md':
                return 'w-6 h-6'
            case 'lg':
                return 'w-8 h-8'
            case 'xl':
                return 'w-12 h-12'
            default:
                return 'w-6 h-6'
        }
    }

    const getTextSize = () => {
        switch (size) {
            case 'sm':
                return 'text-sm'
            case 'md':
                return 'text-base'
            case 'lg':
                return 'text-lg'
            case 'xl':
                return 'text-xl'
            default:
                return 'text-base'
        }
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="flex items-center space-x-2">
                <Loader2 className={`animate-spin ${getSizeClasses()}`} />
                {text && (
                    <span className={`text-gray-600 dark:text-gray-300 ${getTextSize()}`}>
                        {text}
                    </span>
                )}
            </div>
        </div>
    )
}

// Specialized loading components for different contexts
export function ButtonLoadingSpinner({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="flex items-center justify-center">
            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
            {text}
        </div>
    )
}

export function PageLoadingSpinner({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                <p className="text-lg text-gray-600 dark:text-gray-300">{text}</p>
            </div>
        </div>
    )
}

export function InlineLoadingSpinner({ text }: { text?: string }) {
    return (
        <div className="flex items-center space-x-2 py-2">
            <Loader2 className="animate-spin w-4 h-4 text-gray-500" />
            {text && <span className="text-sm text-gray-500">{text}</span>}
        </div>
    )
}