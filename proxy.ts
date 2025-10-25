import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Simplified middleware for Next.js 16 - Authentication and Security Headers only
 */
export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const response = NextResponse.next()

    try {
        // Add security headers to all responses
        addSecurityHeaders(response)

        // Skip middleware for static files and Next.js internals
        if (
            pathname.startsWith('/_next/') ||
            pathname.startsWith('/static/') ||
            pathname.includes('.') && !pathname.includes('/api/')
        ) {
            return response
        }

        // Authentication logic
        const authResult = await handleAuthentication(request, pathname)
        if (authResult) {
            return authResult
        }

        return response
    } catch (error) {
        console.error('Proxy middleware error:', error)

        // Return a generic error response
        return new NextResponse(
            JSON.stringify({ error: 'Authentication validation failed' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...getSecurityHeaders()
                }
            }
        )
    }
}

/**
 * Handles authentication and redirects
 */
async function handleAuthentication(request: NextRequest, pathname: string) {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/settings', '/generate', '/questionnaire']

    // Auth routes that should redirect if already logged in
    const authRoutes = ['/auth/login', '/auth/register']

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // Check if user has a valid session
    let isAuthenticated = false
    if (sessionCookie) {
        try {
            const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
            isAuthenticated = Date.now() < sessionData.expires
        } catch {
            // Invalid session cookie
            isAuthenticated = false
        }
    }

    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect authenticated users from auth routes
    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return null
}



/**
 * Adds comprehensive security headers to the response
 */
function addSecurityHeaders(response: NextResponse) {
    const headers = getSecurityHeaders()
    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value)
    })
}

/**
 * Gets comprehensive security headers
 */
function getSecurityHeaders(): Record<string, string> {
    return {
        // Prevent XSS attacks
        'X-XSS-Protection': '1; mode=block',

        // Prevent MIME type sniffing
        'X-Content-Type-Options': 'nosniff',

        // Prevent clickjacking
        'X-Frame-Options': 'DENY',

        // Referrer policy
        'Referrer-Policy': 'strict-origin-when-cross-origin',

        // Content Security Policy
        'Content-Security-Policy': [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline and unsafe-eval
            "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://api.x.ai https://*.supabase.co",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'"
        ].join('; '),

        // Strict Transport Security (HTTPS only)
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

        // Permissions Policy
        'Permissions-Policy': [
            'camera=()',
            'microphone=()',
            'geolocation=()',
            'payment=()',
            'usb=()',
            'magnetometer=()',
            'accelerometer=()',
            'gyroscope=()'
        ].join(', ')
    }
}

// Configure which paths the proxy should run on
export const config = {
    matcher: [
        /*
        * Match all request paths except for the ones starting with:
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - public folder files
        */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
}