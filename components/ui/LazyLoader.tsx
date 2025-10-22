'use client'

import React, { Suspense, lazy, ComponentType } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface LazyLoaderProps {
    fallback?: React.ReactNode
    error?: React.ComponentType<{ error: Error; retry: () => void }>
}

/**
 * Higher-order component for lazy loading with error boundaries
 */
export function withLazyLoading<P extends object>(
    importFn: () => Promise<{ default: ComponentType<P> }>,
    options: LazyLoaderProps = {}
) {
    const LazyComponent = lazy(importFn)

    return function LazyLoadedComponent(props: P) {
        const { fallback = <LoadingSpinner />, error: ErrorComponent } = options

        return (
            <Suspense fallback={fallback}>
                <ErrorBoundary ErrorComponent={ErrorComponent}>
                    <LazyComponent {...props} />
                </ErrorBoundary>
            </Suspense>
        )
    }
}

/**
 * Error boundary for lazy loaded components
 */
interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    ErrorComponent?: React.ComponentType<{ error: Error; retry: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Lazy loading error:', error, errorInfo)
    }

    retry = () => {
        this.setState({ hasError: false, error: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.ErrorComponent) {
                return (
                    <this.props.ErrorComponent
                        error={this.state.error!}
                        retry={this.retry}
                    />
                )
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-red-600 dark:text-red-400 mb-4">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h3 className="text-lg font-semibold">Something went wrong</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Failed to load component
                        </p>
                    </div>
                    <button
                        onClick={this.retry}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * Preload utility for lazy components
 */
export function preloadComponent<P extends object>(
    importFn: () => Promise<{ default: ComponentType<P> }>
): Promise<{ default: ComponentType<P> }> {
    return importFn()
}

/**
 * Hook for intersection observer-based lazy loading
 */
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export function useIntersectionObserver(
    options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
    const [isIntersecting, setIsIntersecting] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting)
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options
            }
        )

        observer.observe(element)

        return () => {
            observer.unobserve(element)
        }
    }, [options])

    return [ref, isIntersecting]
}

/**
 * Lazy loading container component
 */
interface LazyContainerProps {
    children: React.ReactNode
    fallback?: React.ReactNode
    className?: string
    minHeight?: string
}

export function LazyContainer({
    children,
    fallback = <LoadingSpinner />,
    className = '',
    minHeight = '200px'
}: LazyContainerProps) {
    const [ref, isIntersecting] = useIntersectionObserver()

    return (
        <div
            ref={ref}
            className={className}
            style={{ minHeight }}
        >
            {isIntersecting ? children : fallback}
        </div>
    )
}

/**
 * Image lazy loading component
 */
interface LazyImageProps {
    src: string
    alt: string
    className?: string
    width?: number
    height?: number
    placeholder?: string
}

export function LazyImage({
    src,
    alt,
    className = '',
    width,
    height,
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+'
}: LazyImageProps) {
    const [ref, isIntersecting] = useIntersectionObserver()
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)

    return (
        <div ref={ref} className={`relative ${className}`}>
            {isIntersecting && (
                <>
                    {!isLoaded && !hasError && (
                        <Image
                            src={placeholder}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover blur-sm"
                            width={width}
                            height={height}
                        />
                    )}
                    <Image
                        src={src}
                        alt={alt}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        width={width}
                        height={height}
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setHasError(true)}
                    />
                    {hasError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}