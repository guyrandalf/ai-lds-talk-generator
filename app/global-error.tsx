'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface GlobalErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // Log critical error to monitoring service
        console.error('Critical application error:', error)

        // In production, send to error monitoring service with high priority
        if (process.env.NODE_ENV === 'production') {
            // logCriticalError(error)
        }
    }, [error])

    return (
        <html>
            <body className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 text-center">
                        {/* Error Icon */}
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        {/* Error Title */}
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Application Error
                        </h1>

                        {/* Error Message */}
                        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                            We encountered a critical error that prevented the application from loading properly.
                            Please try refreshing the page.
                        </p>

                        {/* Error Details (Development Only) */}
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                    Technical Details
                                </summary>
                                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto">
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

                        {/* Action Button */}
                        <button
                            onClick={reset}
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </button>

                        {/* Help Text */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                            If this problem persists, please contact support or try again later.
                        </p>
                    </div>
                </div>
            </body>
        </html>
    )
}