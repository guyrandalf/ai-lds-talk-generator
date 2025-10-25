'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log error to monitoring service
        console.error('Application error:', error)

        // In production, you would send this to your error monitoring service
        // Example: Sentry, LogRocket, etc.
        if (process.env.NODE_ENV === 'production') {
            // logErrorToService(error)
        }
    }, [error])

    const getErrorMessage = (error: Error) => {
        // Provide user-friendly error messages based on error type
        if (error.message.includes('Network')) {
            return 'Unable to connect to our servers. Please check your internet connection and try again.'
        }

        if (error.message.includes('Authentication')) {
            return 'Your session has expired. Please sign in again to continue.'
        }

        if (error.message.includes('Validation')) {
            return 'There was an issue with the information provided. Please check your inputs and try again.'
        }

        if (error.message.includes('XAI') || error.message.includes('AI')) {
            return 'Our talk generation service is temporarily unavailable. Please try again in a few moments.'
        }

        if (error.message.includes('Database')) {
            return 'We\'re experiencing technical difficulties. Please try again later.'
        }

        // Generic fallback message
        return 'Something went wrong. We\'re working to fix this issue.'
    }

    const getErrorTitle = (error: Error) => {
        if (error.message.includes('Network')) {
            return 'Connection Problem'
        }

        if (error.message.includes('Authentication')) {
            return 'Session Expired'
        }

        if (error.message.includes('XAI') || error.message.includes('AI')) {
            return 'Service Temporarily Unavailable'
        }

        return 'Oops! Something Went Wrong'
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 transition-colors">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center transition-colors">
                    {/* Error Icon */}
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>

                    {/* Error Title */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        {getErrorTitle(error)}
                    </h1>

                    {/* Error Message */}
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {getErrorMessage(error)}
                    </p>

                    {/* Error Details (Development Only) */}
                    {process.env.NODE_ENV === 'development' && (
                        <details className="mb-6 text-left">
                            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 :text-gray-300">
                                Technical Details
                            </summary>
                            <div className="mt-2 p-3 bg-gray-100 rounded-lg text-xs font-mono text-gray-800 overflow-auto">
                                <div className="mb-2">
                                    <strong>Error:</strong> {error.message}
                                </div>
                                {error.digest && (
                                    <div className="mb-2">
                                        <strong>Digest:</strong> {error.digest}
                                    </div>
                                )}
                                {error.stack && (
                                    <div>
                                        <strong>Stack:</strong>
                                        <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
                                    </div>
                                )}
                            </div>
                        </details>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </button>

                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 :bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Link>
                    </div>

                    {/* Help Text */}
                    <p className="text-sm text-gray-500 mt-6">
                        If this problem persists, please try refreshing the page or contact support.
                    </p>
                </div>
            </div>
        </div>
    )
}