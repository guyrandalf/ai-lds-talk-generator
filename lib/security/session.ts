import crypto from 'crypto'

/**
 * Signed session tokens.
 *
 * The token is `base64url(payload).base64url(hmacSha256(payload, secret))`.
 * Without the HMAC signature a client could base64-encode any userId and
 * impersonate any account, so every read verifies the signature with a
 * timing-safe comparison before trusting the payload.
 *
 * Framework-agnostic on purpose (no next/headers, no 'use server') so both the
 * server actions and the proxy middleware can import it in the Node runtime.
 */

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface SessionPayload {
    userId: string
    expires: number
}

function getSecret(): string {
    const secret = process.env.SESSION_SECRET
    if (!secret || secret.length < 32) {
        throw new Error(
            'SESSION_SECRET is missing or too short (need at least 32 characters). Set it in the environment.'
        )
    }
    return secret
}

function sign(data: string): string {
    return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url')
}

export function createSessionToken(userId: string, ttlMs: number = SESSION_TTL_MS): string {
    const payload: SessionPayload = { userId, expires: Date.now() + ttlMs }
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
    return `${encoded}.${sign(encoded)}`
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
    if (!token) return null

    const dotIndex = token.lastIndexOf('.')
    if (dotIndex <= 0) return null

    const encoded = token.slice(0, dotIndex)
    const signature = token.slice(dotIndex + 1)

    const expected = sign(encoded)
    const sigBuf = Buffer.from(signature)
    const expBuf = Buffer.from(expected)

    // Reject before timingSafeEqual, which throws on length mismatch.
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return null
    }

    try {
        const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as SessionPayload
        if (typeof payload.userId !== 'string' || typeof payload.expires !== 'number') {
            return null
        }
        if (Date.now() > payload.expires) {
            return null
        }
        return payload
    } catch {
        return null
    }
}
