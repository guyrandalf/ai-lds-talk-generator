import { RateLimitResult } from './rateLimit'

/**
 * Creates rate limit headers for HTTP responses
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    const headers: Record<string, string> = {
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
    }

    if (result.blocked && result.blockExpires) {
        headers['X-RateLimit-Blocked-Until'] = Math.ceil(result.blockExpires / 1000).toString()
    }

    return headers
}

/**
 * Manually unblock an IP (for admin use) - utility function
 */
export function unblockIPSync(ip: string, blockedCache: any): boolean {
    const blockKey = `blocked:${ip}`
    return blockedCache.del(blockKey) > 0
}