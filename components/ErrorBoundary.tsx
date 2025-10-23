'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        this.setState({
            error,
            errorInfo
        })

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }

        // In production, send to error monitoring service
        if (process.env.NODE_ENV === 'production') {
            // logErrorToService(error, errorInfo)
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <div className="min-h-[400px] flex items-center justify-center px-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
                            {/* Error Icon */}
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>

                            {/* Error Title */}
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                Something went wrong
                            </h2>

                            {/* Error Message */}
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                We encountered an unexpected error. Please try refreshing this section or go back to the home page.
                            </p>

                            {/* Error Details (Development Only) */}
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mb-6 text-left">
                                    <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                        Technical Details
                                    </summary>
                                    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto">
                                        <div className="mb-2">
                                            <strong>Error:</strong> {this.state.error.message}
                                        </div>
                                        {this.state.error.stack && (
                                            <div className="mb-2">
                                                <strong>Stack:</strong>
                                                <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                                            </div>
                                        )}
                                        {this.state.errorInfo && (
                                            <div>
                                                <strong>Component Stack:</strong>
                                                <pre className="mt-1 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={this.handleReset}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </button>

                                <Link
                                    href="/"
                                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Go Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    )

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

    return WrappedComponent
}

export default ErrorBoundary