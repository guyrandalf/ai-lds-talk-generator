'use client'

import { ReactNode } from 'react'
import LoadingSpinner from './LoadingSpinner'
import { TalkGenerationProgress } from './ProgressBar'

interface LoadingOverlayProps {
 isLoading: boolean
 children: ReactNode
 loadingText?: string
 className?: string
 blur?: boolean
}

export default function LoadingOverlay({
 isLoading,
 children,
 loadingText = 'Loading...',
 className = '',
 blur = true
}: LoadingOverlayProps) {
 return (
 <div className={`relative ${className}`}>
 {children}

 {isLoading && (
 <div className="absolute inset-0 z-50 flex items-center justify-center">
 {/* Backdrop */}
 <div className={`absolute inset-0 bg-white/80 ${blur ? 'backdrop-blur-sm' : ''} transition-opacity`} />

 {/* Loading Content */}
 <div className="relative z-10">
 <LoadingSpinner size="lg" text={loadingText} />
 </div>
 </div>
 )}
 </div>
 )
}

// Specialized loading overlays
interface TalkGenerationOverlayProps {
 isLoading: boolean
 children: ReactNode
 stage?: 'processing' | 'generating' | 'validating' | 'complete'
 progress?: number
}

export function TalkGenerationOverlay({
 isLoading,
 children,
 stage = 'processing',
 progress = 0
}: TalkGenerationOverlayProps) {
 return (
 <div className="relative">
 {children}

 {isLoading && (
 <div className="absolute inset-0 z-50 flex items-center justify-center">
 {/* Backdrop */}
 <div className="absolute inset-0 bg-white/90 backdrop-blur-sm transition-opacity" />

 {/* Loading Content */}
 <div className="relative z-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full mx-4">
 <TalkGenerationProgress stage={stage} progress={progress} />
 </div>
 </div>
 )}
 </div>
 )
}

interface FormLoadingOverlayProps {
 isLoading: boolean
 children: ReactNode
 loadingText?: string
}

export function FormLoadingOverlay({
 isLoading,
 children,
 loadingText = 'Processing...'
}: FormLoadingOverlayProps) {
 return (
 <div className="relative">
 {children}

 {isLoading && (
 <div className="absolute inset-0 z-40 flex items-center justify-center">
 {/* Backdrop */}
 <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] transition-opacity" />

 {/* Loading Content */}
 <div className="relative z-10 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
 <LoadingSpinner size="md" text={loadingText} />
 </div>
 </div>
 )}
 </div>
 )
}