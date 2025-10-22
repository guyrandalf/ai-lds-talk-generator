'use client'

import { useState, useCallback } from 'react'

export interface LoadingState {
    isLoading: boolean
    error: string | null
    progress: number
    stage: string | null
}

export interface LoadingActions {
    setLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    setProgress: (progress: number) => void
    setStage: (stage: string | null) => void
    reset: () => void
    startLoading: (stage?: string) => void
    finishLoading: () => void
    failLoading: (error: string) => void
}

const initialState: LoadingState = {
    isLoading: false,
    error: null,
    progress: 0,
    stage: null
}

export function useLoadingState(): LoadingState & LoadingActions {
    const [state, setState] = useState<LoadingState>(initialState)

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, isLoading: loading }))
    }, [])

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error }))
    }, [])

    const setProgress = useCallback((progress: number) => {
        setState(prev => ({ ...prev, progress: Math.min(Math.max(progress, 0), 100) }))
    }, [])

    const setStage = useCallback((stage: string | null) => {
        setState(prev => ({ ...prev, stage }))
    }, [])

    const reset = useCallback(() => {
        setState(initialState)
    }, [])

    const startLoading = useCallback((stage?: string) => {
        setState({
            isLoading: true,
            error: null,
            progress: 0,
            stage: stage || null
        })
    }, [])

    const finishLoading = useCallback(() => {
        setState(prev => ({
            ...prev,
            isLoading: false,
            progress: 100,
            stage: 'complete'
        }))
    }, [])

    const failLoading = useCallback((error: string) => {
        setState(prev => ({
            ...prev,
            isLoading: false,
            error,
            stage: 'error'
        }))
    }, [])

    return {
        ...state,
        setLoading,
        setError,
        setProgress,
        setStage,
        reset,
        startLoading,
        finishLoading,
        failLoading
    }
}

// Specialized hook for async operations
export function useAsyncOperation<T = unknown>() {
    const loadingState = useLoadingState()

    const execute = useCallback(async (
        operation: () => Promise<T>,
        options?: {
            onSuccess?: (result: T) => void
            onError?: (error: Error) => void
            stages?: string[]
            progressCallback?: (progress: number, stage?: string) => void
        }
    ): Promise<T | null> => {
        const { onSuccess, onError, stages = [], progressCallback } = options || {}

        try {
            loadingState.startLoading(stages[0])

            // Simulate progress through stages
            if (stages.length > 0) {
                for (let i = 0; i < stages.length; i++) {
                    const progress = ((i + 1) / stages.length) * 100
                    loadingState.setStage(stages[i])
                    loadingState.setProgress(progress)

                    if (progressCallback) {
                        progressCallback(progress, stages[i])
                    }

                    // Small delay to show progress
                    if (i < stages.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 100))
                    }
                }
            }

            const result = await operation()

            loadingState.finishLoading()

            if (onSuccess) {
                onSuccess(result)
            }

            return result
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
            loadingState.failLoading(errorMessage)

            if (onError && error instanceof Error) {
                onError(error)
            }

            return null
        }
    }, [loadingState])

    return {
        ...loadingState,
        execute
    }
}

// Hook for form submissions with loading states
export function useFormSubmission<T = unknown>() {
    const loadingState = useLoadingState()

    const submit = useCallback(async (
        submitFunction: () => Promise<T>,
        options?: {
            onSuccess?: (result: T) => void
            onError?: (error: Error) => void
            successMessage?: string
            errorMessage?: string
        }
    ): Promise<boolean> => {
        const { onSuccess, onError, errorMessage } = options || {}

        try {
            loadingState.startLoading('submitting')

            const result = await submitFunction()

            loadingState.finishLoading()

            if (onSuccess) {
                onSuccess(result)
            }

            return true
        } catch (error) {
            const message = errorMessage || (error instanceof Error ? error.message : 'Submission failed')
            loadingState.failLoading(message)

            if (onError && error instanceof Error) {
                onError(error)
            }

            return false
        }
    }, [loadingState])

    return {
        ...loadingState,
        submit
    }
}