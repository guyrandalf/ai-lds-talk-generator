'use server'

import { generateCSRFToken, getCSRFToken } from './csrf'

/**
 * Server component helper to get or generate CSRF token
 */
export async function getOrGenerateCSRFToken(): Promise<string> {
    let token = await getCSRFToken()

    if (!token) {
        token = await generateCSRFToken()
    }

    return token
}

/**
 * Creates a hidden CSRF input field for forms
 */
export function createCSRFInput(token: string): string {
    return `<input type="hidden" name="csrf-token" value="${token}" />`
}

/**
 * Client-side helper to add CSRF token to fetch requests
 */
export function addCSRFToHeaders(headers: HeadersInit = {}): HeadersInit {
    // This will be used client-side, so we need to get the token from a meta tag or cookie
    return {
        ...headers,
        'X-CSRF-Token': getCSRFTokenFromClient()
    }
}

/**
 * Client-side function to get CSRF token (to be used in browser)
 */
function getCSRFTokenFromClient(): string {
    // Try to get from meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
    if (metaTag) {
        return metaTag.content
    }

    // Fallback to cookie (though this is less secure)
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'csrf-token') {
            return decodeURIComponent(value)
        }
    }

    return ''
}