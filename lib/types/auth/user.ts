// User-related type definitions
// This file contains all user and authentication types

/**
 * Base user interface containing core user properties
 */
export interface BaseUser {
    id: string
    email: string
    firstName: string
    lastName: string
}

/**
 * Authenticated user interface extending BaseUser with additional properties
 * Used for users who have been authenticated and have full access
 */
export interface AuthenticatedUser extends BaseUser {
    createdAt?: Date
    updatedAt?: Date
}

/**
 * User profile interface for profile management and display
 * Extends BaseUser with optional preference settings
 */
export interface UserProfile extends BaseUser {
    preferences?: UserPreferences
}

/**
 * User preferences interface for storing user-specific settings
 */
export interface UserPreferences {
    defaultMeetingType?: string
    preferredThemes?: string[]
    audienceType?: string
}