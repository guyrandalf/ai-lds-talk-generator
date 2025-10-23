'use client'

import React from 'react'

interface AsyncErrorBoundaryState {
    hasError: boolean
    error?: Error
}

interface AsyncErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>
    onError?: (error: Error) => void
}

class AsyncErrorBoundary extends React.Component<AsyncErrorBoundaryProps, AsyncErrorBoundaryState> {
    constructor(props: AsyncErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): AsyncErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('AsyncErrorBoundary caught an error:', error, errorInfo)
        this.props.onError?.(error)
    }

    retry = () => {
        this.setState({ hasError: false, error: undefined })
    }

    render() {
        if (this.state.hasError) {
            const FallbackComponent = this.props.fallback || DefaultErrorFallback
            return <FallbackComponent error={this.state.error} retry={this.retry} />
        }

        return this.props.children
    }
}

function DefaultErrorFallback({ error, retry }: { error?: Error; retry?: () => void }) {
    return (
        <div className="p-6 text-center">
            <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
                <p className="text-sm text-gray-600 mb-4">
                    {error?.message || 'An unexpected error occurred while loading this component.'}
                </p>
            </div>
            {retry && (
                <button
                    onClick={retry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    )
}

export { AsyncErrorBoundary, DefaultErrorFallback }