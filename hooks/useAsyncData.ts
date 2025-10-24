'use client'

import { useState, useEffect, useCallback } from 'react'

interface AsyncDataState<T> {
    data: T | null
    isLoading: boolean
    error: Error | null
    refetch: () => Promise<void>
}

interface UseAsyncDataOptions<T> {
    initialData?: T | null
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
}

export function useAsyncData<T>(
    asyncFunction: () => Promise<T>,
    dependencies: unknown[] = [],
    options: UseAsyncDataOptions<T> = {}
): AsyncDataState<T> {
    const [data, setData] = useState<T | null>(options.initialData || null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await asyncFunction()
            setData(result)
            options.onSuccess?.(result)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An error occurred')
            setError(error)
            options.onError?.(error)
        } finally {
            setIsLoading(false)
        }
    }, dependencies)

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const refetch = useCallback(async () => {
        await fetchData()
    }, [fetchData])

    return {
        data,
        isLoading,
        error,
        refetch
    }
}

// Hook for managing multiple async operations
export function useAsyncOperations() {
    const [operations, setOperations] = useState<Record<string, boolean>>({})

    const setLoading = useCallback((key: string, loading: boolean) => {
        setOperations(prev => ({
            ...prev,
            [key]: loading
        }))
    }, [])

    const isLoading = useCallback((key: string) => {
        return operations[key] || false
    }, [operations])

    const isAnyLoading = useCallback(() => {
        return Object.values(operations).some(loading => loading)
    }, [operations])

    return {
        setLoading,
        isLoading,
        isAnyLoading,
        operations
    }
}