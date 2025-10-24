'use server'

import { unstable_cache } from 'next/cache'

/**
 * Database query optimization utilities
 */

// Optimized database connection pool settings
export const DATABASE_CONFIG = {
    // Connection pool settings for better performance
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,

    // Query optimization settings
    queryTimeout: 30000,
    statementTimeout: 30000,

    // Connection reuse settings
    idleTimeout: 300000, // 5 minutes
    maxLifetime: 1800000, // 30 minutes
}

/**
 * Memoization wrapper for expensive operations
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string
): T {
    const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>()
    const TTL = 5 * 60 * 1000 // 5 minutes

    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
        const now = Date.now()

        // Check if we have a cached result that's still valid
        const cached = cache.get(key)
        if (cached && (now - cached.timestamp) < TTL) {
            return cached.value
        }

        // Execute function and cache result
        const result = fn(...args) as ReturnType<T>
        cache.set(key, { value: result, timestamp: now })

        // Clean up old entries periodically
        if (cache.size > 100) {
            for (const [cacheKey, cacheValue] of cache.entries()) {
                if ((now - cacheValue.timestamp) > TTL) {
                    cache.delete(cacheKey)
                }
            }
        }

        return result
    }) as T
}

/**
 * Debounce function for reducing API calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout)
        }

        timeout = setTimeout(() => {
            func(...args)
        }, wait)
    }
}

/**
 * Throttle function for rate limiting
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

/**
 * Batch processing utility for database operations
 */
export class BatchProcessor<T> {
    private batch: T[] = []
    private batchSize: number
    private flushInterval: number
    private processor: (items: T[]) => Promise<void>
    private timer: NodeJS.Timeout | null = null

    constructor(
        processor: (items: T[]) => Promise<void>,
        batchSize: number = 10,
        flushInterval: number = 5000
    ) {
        this.processor = processor
        this.batchSize = batchSize
        this.flushInterval = flushInterval
    }

    add(item: T): void {
        this.batch.push(item)

        // Process if batch is full
        if (this.batch.length >= this.batchSize) {
            this.flush()
        } else if (!this.timer) {
            // Set timer for automatic flush
            this.timer = setTimeout(() => {
                this.flush()
            }, this.flushInterval)
        }
    }

    async flush(): Promise<void> {
        if (this.batch.length === 0) return

        const itemsToProcess = [...this.batch]
        this.batch = []

        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }

        try {
            await this.processor(itemsToProcess)
        } catch (error) {
            console.error('Batch processing error:', error)
            // Could implement retry logic here
        }
    }
}

/**
 * Lazy loading utility for components
 */
export function createLazyLoader<T>(
    loader: () => Promise<T>,
    fallback?: T
): () => Promise<T> {
    let cached: T | null = null
    let loading: Promise<T> | null = null

    return async (): Promise<T> => {
        if (cached) {
            return cached
        }

        if (loading) {
            return loading
        }

        loading = loader().then(result => {
            cached = result
            loading = null
            return result
        }).catch(error => {
            loading = null
            if (fallback) {
                cached = fallback
                return fallback
            }
            throw error
        })

        return loading
    }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
    private static timers = new Map<string, number>()

    static start(label: string): void {
        this.timers.set(label, performance.now())
    }

    static end(label: string): number {
        const startTime = this.timers.get(label)
        if (!startTime) {
            console.warn(`No timer found for label: ${label}`)
            return 0
        }

        const duration = performance.now() - startTime
        this.timers.delete(label)

        console.log(`Performance [${label}]: ${duration.toFixed(2)}ms`)
        return duration
    }

    static async measure<T>(
        label: string,
        operation: () => Promise<T>
    ): Promise<T> {
        this.start(label)
        try {
            const result = await operation()
            this.end(label)
            return result
        } catch (error) {
            this.end(label)
            throw error
        }
    }
}

/**
 * Memory usage optimization
 */
export function optimizeMemoryUsage() {
    // Force garbage collection if available (Node.js with --expose-gc flag)
    if (global.gc) {
        global.gc()
    }

    // Log memory usage
    const memUsage = process.memoryUsage()
    console.log('Memory usage:', {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
    })
}

/**
 * Next.js cache optimization
 */
export const createOptimizedCache = <T>(
    fn: (...args: unknown[]) => Promise<T>,
    keyParts: string[],
    revalidate: number = 3600 // 1 hour default
) => {
    return unstable_cache(
        fn,
        keyParts,
        {
            revalidate,
            tags: keyParts
        }
    )
}

/**
 * Database query optimization helpers
 */
export const optimizeQuery = {
    // Select only needed fields
    selectFields: <T extends Record<string, unknown>>(
        fields: (keyof T)[]
    ): Record<string, boolean> => {
        return fields.reduce((acc, field) => {
            acc[field as string] = true
            return acc
        }, {} as Record<string, boolean>)
    },

    // Pagination helper
    paginate: (page: number, limit: number = 10) => ({
        skip: (page - 1) * limit,
        take: limit
    }),

    // Sorting helper
    orderBy: <T>(field: keyof T, direction: 'asc' | 'desc' = 'desc') => ({
        [field]: direction
    })
}

/**
 * Asset optimization utilities
 */
export const assetOptimization = {
    // Image optimization settings
    imageConfig: {
        domains: ['churchofjesuschrist.org', 'lds.org'],
        formats: ['image/webp', 'image/avif'],
        sizes: [16, 32, 48, 64, 96, 128, 256, 384],
        quality: 85,
        minimumCacheTTL: 86400 // 24 hours
    },

    // Font optimization
    fontConfig: {
        preload: [
            '/fonts/inter-var.woff2',
            '/fonts/inter-var-latin.woff2'
        ],
        display: 'swap' as const
    },

    // Static asset caching
    staticAssetHeaders: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Vary': 'Accept-Encoding'
    }
}

/**
 * Bundle optimization utilities
 */
export const bundleOptimization = {
    // Dynamic imports for code splitting
    dynamicImport: <T>(
        importFn: () => Promise<{ default: T }>,
        fallback?: T
    ) => {
        return async (): Promise<T> => {
            try {
                const m = await importFn()
                return m.default
            } catch (error) {
                console.error('Dynamic import failed:', error)
                if (fallback) {
                    return fallback
                }
                throw error
            }
        }
    },

    // Preload critical resources
    preloadResource: (href: string, as: string, type?: string) => {
        if (typeof document !== 'undefined') {
            const link = document.createElement('link')
            link.rel = 'preload'
            link.href = href
            link.as = as
            if (type) link.type = type
            document.head.appendChild(link)
        }
    }
}