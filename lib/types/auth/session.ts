// Session and authentication type definitions
// This file contains session-related types

import { BaseUser } from './user'

/**
 * User session interface for managing user sessions
 */
export interface UserSession {
    userId: string
    sessionId?: string
    expiresAt?: Date
}

/**
 * Authentication result interface for login/register operations
 * Used to return success/error status along with user data
 */
export interface AuthResult {
    success: boolean
    user?: BaseUser
    error?: string
    warnings?: string[]
}