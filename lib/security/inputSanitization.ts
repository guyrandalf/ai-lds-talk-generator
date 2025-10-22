'use server'

import { z } from 'zod'

// Enhanced input sanitization with comprehensive security measures

/**
 * Comprehensive input sanitization configuration
 */
const SANITIZATION_CONFIG = {
    // Maximum lengths for different input types
    maxLengths: {
        email: 254,
        password: 128,
        name: 100,
        topic: 200,
        personalStory: 10000,
        url: 2048,
        general: 5000
    },

    // Dangerous patterns to remove or escape
    dangerousPatterns: [
        // Script injection
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
        /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
        /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
        /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,

        // JavaScript protocols
        /javascript:/gi,
        /vbscript:/gi,
        /data:(?!image\/)/gi, // Allow data: for images only
        /file:/gi,

        // Event handlers
        /on\w+\s*=/gi,

        // SQL injection patterns
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,

        // Command injection patterns
        /[;&|`$(){}[\]]/g,

        // Path traversal
        /\.\.[\/\\]/g,

        // Null bytes
        /\x00/g
    ],

    // Allowed HTML tags for rich text (if needed)
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],

    // Patterns for sensitive information
    sensitivePatterns: [
        {
            pattern: /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
            replacement: '[SSN_REMOVED]',
            description: 'Social Security Number'
        },
        {
            pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card
            replacement: '[CARD_REMOVED]',
            description: 'Credit Card Number'
        },
        {
            pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone number
            replacement: '[PHONE_REMOVED]',
            description: 'Phone Number'
        },
        {
            pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
            replacement: '[EMAIL_REMOVED]',
            description: 'Email Address'
        }
    ]
}

export interface SanitizationResult {
    success: boolean
    sanitizedValue: string
    originalValue: string
    removedPatterns: string[]
    warnings: string[]
    errors: string[]
}

export interface ValidationResult {
    success: boolean
    value?: string
    errors: string[]
    warnings: string[]
}

/**
 * Enhanced input sanitization with security focus
 */
export async function sanitizeInput(
    input: string,
    type: 'email' | 'password' | 'name' | 'topic' | 'personalStory' | 'url' | 'general' = 'general',
    options: {
        allowHTML?: boolean
        preserveNewlines?: boolean
        removeSensitiveInfo?: boolean
    } = {}
): Promise<SanitizationResult> {
    const { allowHTML = false, preserveNewlines = true, removeSensitiveInfo = true } = options

    if (!input || typeof input !== 'string') {
        return {
            success: true,
            sanitizedValue: '',
            originalValue: input || '',
            removedPatterns: [],
            warnings: [],
            errors: []
        }
    }

    let sanitized = input.trim()
    const removedPatterns: string[] = []
    const warnings: string[] = []
    const errors: string[] = []
    const originalValue = input

    try {
        // Check length limits
        const maxLength = SANITIZATION_CONFIG.maxLengths[type]
        if (sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength)
            warnings.push(`Input truncated to ${maxLength} characters`)
        }

        // Remove dangerous patterns
        for (const pattern of SANITIZATION_CONFIG.dangerousPatterns) {
            const matches = sanitized.match(pattern)
            if (matches) {
                removedPatterns.push(`Dangerous pattern: ${matches[0]}`)
                sanitized = sanitized.replace(pattern, '')
            }
        }

        // Remove sensitive information if requested
        if (removeSensitiveInfo) {
            for (const { pattern, replacement, description } of SANITIZATION_CONFIG.sensitivePatterns) {
                const matches = sanitized.match(pattern)
                if (matches) {
                    removedPatterns.push(`${description}: ${matches.length} instance(s)`)
                    sanitized = sanitized.replace(pattern, replacement)
                }
            }
        }

        // Handle HTML content
        if (!allowHTML) {
            // Escape HTML entities
            sanitized = sanitized
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;')
        } else {
            // Allow only specific HTML tags
            const allowedTagsRegex = new RegExp(`<(?!\/?(?:${SANITIZATION_CONFIG.allowedTags.join('|')})\b)[^>]*>`, 'gi')
            const htmlMatches = sanitized.match(allowedTagsRegex)
            if (htmlMatches) {
                removedPatterns.push(`Disallowed HTML tags: ${htmlMatches.length} instance(s)`)
                sanitized = sanitized.replace(allowedTagsRegex, '')
            }
        }

        // Handle newlines
        if (!preserveNewlines) {
            sanitized = sanitized.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ')
        }

        // Type-specific validation
        switch (type) {
            case 'email':
                // Additional email validation
                if (sanitized && !isValidEmail(sanitized)) {
                    errors.push('Invalid email format after sanitization')
                }
                break

            case 'url':
                // Additional URL validation
                if (sanitized && !isValidURL(sanitized)) {
                    errors.push('Invalid URL format after sanitization')
                }
                break

            case 'password':
                // Password should not be logged or have patterns removed
                removedPatterns.length = 0 // Clear for security
                break
        }

        // Final cleanup
        sanitized = sanitized.trim()

        // Check if sanitization was too aggressive
        if (originalValue.length > 0 && sanitized.length === 0) {
            warnings.push('Input was completely sanitized - may be too restrictive')
        }

        return {
            success: errors.length === 0,
            sanitizedValue: sanitized,
            originalValue,
            removedPatterns,
            warnings,
            errors
        }
    } catch (error) {
        console.error('Sanitization error:', error)
        return {
            success: false,
            sanitizedValue: '',
            originalValue,
            removedPatterns,
            warnings,
            errors: ['Sanitization process failed']
        }
    }
}

/**
 * Validates and sanitizes form data with comprehensive security checks
 */
export async function sanitizeFormData(
    formData: FormData,
    fieldConfig: Record<string, {
        type: 'email' | 'password' | 'name' | 'topic' | 'personalStory' | 'url' | 'general'
        required?: boolean
        allowHTML?: boolean
        preserveNewlines?: boolean
        removeSensitiveInfo?: boolean
    }>
): Promise<{
    success: boolean
    sanitizedData: Record<string, string>
    errors: Record<string, string[]>
    warnings: Record<string, string[]>
}> {
    const sanitizedData: Record<string, string> = {}
    const errors: Record<string, string[]> = {}
    const warnings: Record<string, string[]> = {}

    for (const [fieldName, config] of Object.entries(fieldConfig)) {
        const rawValue = formData.get(fieldName) as string || ''

        // Check required fields
        if (config.required && !rawValue.trim()) {
            errors[fieldName] = [`${fieldName} is required`]
            continue
        }

        // Sanitize the field
        const result = await sanitizeInput(rawValue, config.type, {
            allowHTML: config.allowHTML,
            preserveNewlines: config.preserveNewlines,
            removeSensitiveInfo: config.removeSensitiveInfo
        })

        if (result.success) {
            sanitizedData[fieldName] = result.sanitizedValue
        } else {
            errors[fieldName] = result.errors
        }

        if (result.warnings.length > 0) {
            warnings[fieldName] = result.warnings
        }
    }

    return {
        success: Object.keys(errors).length === 0,
        sanitizedData,
        errors,
        warnings
    }
}

/**
 * Validates and sanitizes JSON data
 */
export async function sanitizeJSONData(
    data: Record<string, any>,
    fieldConfig: Record<string, {
        type: 'email' | 'password' | 'name' | 'topic' | 'personalStory' | 'url' | 'general'
        required?: boolean
        allowHTML?: boolean
        preserveNewlines?: boolean
        removeSensitiveInfo?: boolean
    }>
): Promise<{
    success: boolean
    sanitizedData: Record<string, string>
    errors: Record<string, string[]>
    warnings: Record<string, string[]>
}> {
    const sanitizedData: Record<string, string> = {}
    const errors: Record<string, string[]> = {}
    const warnings: Record<string, string[]> = {}

    for (const [fieldName, config] of Object.entries(fieldConfig)) {
        const rawValue = data[fieldName]
        const stringValue = typeof rawValue === 'string' ? rawValue : String(rawValue || '')

        // Check required fields
        if (config.required && !stringValue.trim()) {
            errors[fieldName] = [`${fieldName} is required`]
            continue
        }

        // Sanitize the field
        const result = await sanitizeInput(stringValue, config.type, {
            allowHTML: config.allowHTML,
            preserveNewlines: config.preserveNewlines,
            removeSensitiveInfo: config.removeSensitiveInfo
        })

        if (result.success) {
            sanitizedData[fieldName] = result.sanitizedValue
        } else {
            errors[fieldName] = result.errors
        }

        if (result.warnings.length > 0) {
            warnings[fieldName] = result.warnings
        }
    }

    return {
        success: Object.keys(errors).length === 0,
        sanitizedData,
        errors,
        warnings
    }
}

/**
 * Enhanced email validation
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegex.test(email) && email.length <= 254
}

/**
 * Enhanced URL validation
 */
function isValidURL(url: string): boolean {
    try {
        const urlObj = new URL(url)
        return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
        return false
    }
}

/**
 * Validates Church domain URLs with enhanced security
 */
export async function validateChurchURL(url: string): Promise<ValidationResult> {
    const sanitizeResult = await sanitizeInput(url, 'url')

    if (!sanitizeResult.success) {
        return {
            success: false,
            errors: sanitizeResult.errors,
            warnings: sanitizeResult.warnings
        }
    }

    const sanitizedURL = sanitizeResult.sanitizedValue

    if (!sanitizedURL) {
        return {
            success: false,
            errors: ['URL is required'],
            warnings: []
        }
    }

    try {
        const urlObj = new URL(sanitizedURL)
        const hostname = urlObj.hostname.toLowerCase()

        // Check if it's a Church domain
        const churchDomains = [
            'churchofjesuschrist.org',
            'www.churchofjesuschrist.org',
            'lds.org',
            'www.lds.org'
        ]

        const isChurchDomain = churchDomains.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        )

        if (!isChurchDomain) {
            return {
                success: false,
                errors: ['URL must be from churchofjesuschrist.org or lds.org'],
                warnings: []
            }
        }

        return {
            success: true,
            value: sanitizedURL,
            errors: [],
            warnings: sanitizeResult.warnings
        }
    } catch {
        return {
            success: false,
            errors: ['Invalid URL format'],
            warnings: []
        }
    }
}

/**
 * Content security scanner for generated talks
 */
export async function scanContentSecurity(content: string): Promise<{
    safe: boolean
    threats: string[]
    warnings: string[]
    sanitizedContent: string
}> {
    const threats: string[] = []
    const warnings: string[] = []

    const sanitizeResult = await sanitizeInput(content, 'general', {
        allowHTML: false,
        preserveNewlines: true,
        removeSensitiveInfo: true
    })

    // Check for potential security threats
    const threatPatterns = [
        { pattern: /javascript:/gi, threat: 'JavaScript protocol detected' },
        { pattern: /<script/gi, threat: 'Script tag detected' },
        { pattern: /on\w+\s*=/gi, threat: 'Event handler detected' },
        { pattern: /\beval\s*\(/gi, threat: 'Eval function detected' },
        { pattern: /document\.(write|cookie)/gi, threat: 'Document manipulation detected' },
        { pattern: /window\.(location|open)/gi, threat: 'Window manipulation detected' }
    ]

    for (const { pattern, threat } of threatPatterns) {
        if (pattern.test(content)) {
            threats.push(threat)
        }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
        { pattern: /\b(password|secret|token|key)\s*[:=]/gi, warning: 'Potential credential exposure' },
        { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, warning: 'Potential SSN detected' },
        { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, warning: 'Potential credit card detected' }
    ]

    for (const { pattern, warning } of suspiciousPatterns) {
        if (pattern.test(content)) {
            warnings.push(warning)
        }
    }

    return {
        safe: threats.length === 0,
        threats,
        warnings: [...warnings, ...sanitizeResult.warnings],
        sanitizedContent: sanitizeResult.sanitizedValue
    }
}