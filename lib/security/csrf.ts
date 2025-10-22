'use server'

import { cookies } from 'next/headers'
import { randomBytes, createHash } from 'crypto'

const CSRF_TOKEN_NAME = 'csrf-token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const TOKEN_LENGTH = 32

/**
 * Generates a CSRF token and stores it in cookies
 */
export async function generateCSRFToken(): Promise<string> {
    const token = randomBytes(TOKEN_LENGTH).toString('hex')
    const cookieStore = await cookies()

    // Store token in httpOnly cookie
    cookieStore.set(CSRF_TOKEN_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
    })

    return token
}

/**
 * Validates CSRF token from request headers against stored token
 */
export async function validateCSRFToken(headerToken: string | null): Promise<boolean> {
    if (!headerToken) {
        return false
    }

    const cookieStore = await cookies()
    const storedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value

    if (!storedToken) {
        return false
    }

    // Use timing-safe comparison to prevent timing attacks
    return timingSafeEqual(headerToken, storedToken)
}

/**
 * Gets the current CSRF token from cookies
 */
export async function getCSRFToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(CSRF_TOKEN_NAME)?.value || null
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
}

/**
 * Middleware function to validate CSRF tokens for POST requests
 */
export async function validateCSRFMiddleware(request: Request): Promise<boolean> {
    // Only validate CSRF for state-changing methods
    if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        return true
    }

    // Get token from header
    const headerToken = request.headers.get(CSRF_HEADER_NAME)

    return await validateCSRFToken(headerToken)
}

/**
 * Creates a hash of the CSRF token for client-side use (non-sensitive)
 */
export async function createCSRFHash(token: string): Promise<string> {
    return createHash('sha256').update(token).digest('hex').substring(0, 16)
}