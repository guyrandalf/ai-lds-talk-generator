'use server'

import NodeCache from 'node-cache'

// Rate limiting configurations
const RATE_LIMITS = {
    // Authentication endpoints
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // 5 attempts per window
        blockDuration: 30 * 60 * 1000 // 30 minutes block
    },
    // Talk generation endpoints
    generation: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 3, // 3 generations per minute
        blockDuration: 5 * 60 * 1000 // 5 minutes block
    },
    // General API endpoints
    api: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30, // 30 requests per minute
        blockDuration: 2 * 60 * 1000 // 2 minutes block
    },
    // Form submissions
    forms: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10, // 10 submissions per minute
        blockDuration: 5 * 60 * 1000 // 5 minutes block
    }
}

// Cache instances for different rate limit types
const rateLimitCaches = {
    auth: new NodeCache({ stdTTL: RATE_LIMITS.auth.windowMs / 1000 }),
    generation: new NodeCache({ stdTTL: RATE_LIMITS.generation.windowMs / 1000 }),
    api: new NodeCache({ stdTTL: RATE_LIMITS.api.windowMs / 1000 }),
    forms: new NodeCache({ stdTTL: RATE_LIMITS.forms.windowMs / 1000 })
}

// Blocked IPs cache
const blockedCache = new NodeCache()

export interface RateLimitResult {
    allowed: boolean
    remaining: number
    resetTime: number
    blocked: boolean
    blockExpires?: number
}

/**
 * Gets client IP address from request
 */
function getClientIP(request: Request): string {
    // Check various headers for the real IP
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const cfConnectingIP = request.headers.get('cf-connecting-ip')

    if (forwarded) {
        // x-forwarded-for can contain multiple IPs, take the first one
        return forwarded.split(',')[0].trim()
    }

    if (realIP) {
        return realIP
    }

    if (cfConnectingIP) {
        return cfConnectingIP
    }

    // Fallback to a default (this shouldn't happen in production)
    return 'unknown'
}

/**
 * Creates a rate limit key based on IP and optional user ID
 */
function createRateLimitKey(ip: string, userId?: string, endpoint?: string): string {
    const parts = [ip]
    if (userId) parts.push(userId)
    if (endpoint) parts.push(endpoint)
    return parts.join(':')
}

/**
 * Checks if an IP is currently blocked
 */
function isBlocked(ip: string): { blocked: boolean; expires?: number } {
    const blockKey = `blocked:${ip}`
    const blockExpires = blockedCache.get<number>(blockKey)

    if (blockExpires && Date.now() < blockExpires) {
        return { blocked: true, expires: blockExpires }
    }

    if (blockExpires) {
        // Block has expired, remove it
        blockedCache.del(blockKey)
    }

    return { blocked: false }
}

/**
 * Blocks an IP address for a specified duration
 */
function blockIP(ip: string, duration: number): void {
    const blockKey = `blocked:${ip}`
    const blockExpires = Date.now() + duration

    blockedCache.set(blockKey, blockExpires, duration / 1000)

    console.warn(`IP ${ip} has been rate limited and blocked until ${new Date(blockExpires).toISOString()}`)
}

/**
 * Rate limiting middleware for different endpoint types
 */
export async function checkRateLimit(
    request: Request,
    type: keyof typeof RATE_LIMITS,
    userId?: string,
    endpoint?: string
): Promise<RateLimitResult> {
    const ip = getClientIP(request)
    const config = RATE_LIMITS[type]
    const cache = rateLimitCaches[type]

    // Check if IP is blocked
    const blockStatus = isBlocked(ip)
    if (blockStatus.blocked) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: blockStatus.expires!,
            blocked: true,
            blockExpires: blockStatus.expires
        }
    }

    // Create rate limit key
    const key = createRateLimitKey(ip, userId, endpoint)

    // Get current request count
    const currentCount = cache.get<number>(key) || 0
    const newCount = currentCount + 1

    // Calculate reset time
    const resetTime = Date.now() + config.windowMs

    // Check if limit exceeded
    if (newCount > config.maxRequests) {
        // Block the IP
        blockIP(ip, config.blockDuration)

        return {
            allowed: false,
            remaining: 0,
            resetTime,
            blocked: true,
            blockExpires: Date.now() + config.blockDuration
        }
    }

    // Update count in cache
    cache.set(key, newCount, config.windowMs / 1000)

    return {
        allowed: true,
        remaining: config.maxRequests - newCount,
        resetTime,
        blocked: false
    }
}

/**
 * Rate limiting for authentication endpoints
 */
export async function checkAuthRateLimit(request: Request, userId?: string): Promise<RateLimitResult> {
    return checkRateLimit(request, 'auth', userId, 'auth')
}

/**
 * Rate limiting for talk generation endpoints
 */
export async function checkGenerationRateLimit(request: Request, userId?: string): Promise<RateLimitResult> {
    return checkRateLimit(request, 'generation', userId, 'generation')
}

/**
 * Rate limiting for general API endpoints
 */
export async function checkAPIRateLimit(request: Request, userId?: string): Promise<RateLimitResult> {
    return checkRateLimit(request, 'api', userId, 'api')
}

/**
 * Rate limiting for form submissions
 */
export async function checkFormRateLimit(request: Request, userId?: string): Promise<RateLimitResult> {
    return checkRateLimit(request, 'forms', userId, 'forms')
}



/**
 * Manually unblock an IP (for admin use)
 */
export async function unblockIP(ip: string): Promise<boolean> {
    const blockKey = `blocked:${ip}`
    return blockedCache.del(blockKey) > 0
}

/**
 * Get current rate limit status without incrementing
 */
export async function getRateLimitStatus(
    request: Request,
    type: keyof typeof RATE_LIMITS,
    userId?: string,
    endpoint?: string
): Promise<RateLimitResult> {
    const ip = getClientIP(request)
    const config = RATE_LIMITS[type]
    const cache = rateLimitCaches[type]

    // Check if IP is blocked
    const blockStatus = isBlocked(ip)
    if (blockStatus.blocked) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: blockStatus.expires!,
            blocked: true,
            blockExpires: blockStatus.expires
        }
    }

    // Create rate limit key
    const key = createRateLimitKey(ip, userId, endpoint)

    // Get current request count without incrementing
    const currentCount = cache.get<number>(key) || 0
    const remaining = Math.max(0, config.maxRequests - currentCount)

    return {
        allowed: remaining > 0,
        remaining,
        resetTime: Date.now() + config.windowMs,
        blocked: false
    }
}