'use server'

import { sanitizeInput, scanContentSecurity } from './inputSanitization'
import { logSecurityViolationWithContext, checkRateLimit } from './violationLogger'

/**
 * AI Content Filter System
 * Provides comprehensive input validation and content filtering for AI requests
 */

export interface AIContentFilterResult {
    success: boolean
    sanitizedInput?: string
    errors: string[]
    warnings: string[]
    securityViolations: SecurityViolation[]
}

export interface SecurityViolation {
    type: 'inappropriate_content' | 'manipulation_attempt' | 'spam' | 'policy_violation'
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    detectedPattern: string
    timestamp: Date
    userId?: string
    ipAddress?: string
}

export interface ContentValidationRules {
    maxLength: number
    minLength: number
    allowedTopics: string[]
    forbiddenPatterns: RegExp[]
    requiredElements: string[]
}

/**
 * Configuration for AI content filtering
 */
const AI_FILTER_CONFIG = {
    // Maximum input lengths for different types
    maxLengths: {
        topic: 200,
        personalStory: 10000,
        customTheme: 100,
        generalInput: 5000
    },

    // Patterns that indicate manipulation attempts
    manipulationPatterns: [
        // Direct AI instruction attempts
        /\b(?:ignore|forget|disregard)\s+(?:previous|all|your)\s+(?:instructions|prompts|rules)/gi,
        /\b(?:act|pretend|roleplay)\s+(?:as|like)\s+(?:a|an)?\s*(?:different|other|new)\s+(?:ai|assistant|bot|system)/gi,
        /\b(?:system|admin|root|developer)\s+(?:mode|access|override|command)/gi,

        // Prompt injection attempts
        /\b(?:new|different|alternative)\s+(?:prompt|instruction|rule|system)/gi,
        /\b(?:end|stop|terminate)\s+(?:previous|current)\s+(?:prompt|instruction|session)/gi,
        /\b(?:switch|change|modify)\s+(?:to|into)\s+(?:mode|character|personality)/gi,

        // Jailbreak attempts
        /\b(?:jailbreak|bypass|circumvent|override)\s+(?:safety|security|filter|restriction)/gi,
        /\b(?:dan|do anything now|unrestricted|unlimited)\s+(?:mode|access|capability)/gi,

        // Meta-instruction attempts
        /\b(?:you are|you're)\s+(?:now|going to be)\s+(?:a|an)?\s*(?:different|new|other)/gi,
        /\b(?:from now on|starting now|beginning now)/gi,
    ],

    // Inappropriate content patterns for religious context
    inappropriatePatterns: [
        // Political content
        /\b(?:democrat|republican|liberal|conservative|politics|political|government|election|vote|voting|biden|trump|congress|senate)\b/gi,

        // Controversial topics
        /\b(?:abortion|gay marriage|lgbtq|transgender|homosexual|lesbian|bisexual)\b/gi,

        // Anti-religious content
        /\b(?:cult|brainwash|false prophet|fake religion|scam|fraud)\b/gi,

        // Inappropriate language
        /\b(?:damn|hell|crap|stupid|idiot|moron|dumb|sucks|hate)\b/gi,

        // Violence or harmful content
        /\b(?:kill|murder|suicide|death|violence|harm|hurt|attack|weapon|gun|bomb)\b/gi,

        // Sexual content
        /\b(?:sex|sexual|porn|naked|nude|breast|penis|vagina|orgasm|masturbat)\b/gi,

        // Substance abuse
        /\b(?:drug|cocaine|marijuana|alcohol|beer|wine|drunk|high|addiction)\b/gi,
    ],

    // Spam indicators
    spamPatterns: [
        // Repetitive content
        /(.{10,})\1{3,}/gi, // Same text repeated 4+ times

        // Excessive punctuation
        /[!?]{4,}/g,
        /[.]{4,}/g,

        // All caps (more than 50% of content)
        /^[A-Z\s!?.,]{20,}$/,

        // URL spam (non-Church domains)
        /https?:\/\/(?!(?:www\.)?(?:churchofjesuschrist|lds)\.org)[^\s]+/gi,

        // Email addresses
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,

        // Phone numbers
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    ],

    // Required elements for valid religious content
    requiredElements: {
        topic: ['faith', 'gospel', 'christ', 'jesus', 'god', 'spirit', 'church', 'scripture', 'prayer', 'testimony'],
        // At least one of these should be present in topic or related content
    },

    // Church-appropriate themes
    appropriateThemes: [
        'faith', 'hope', 'charity', 'love', 'service', 'obedience', 'prayer', 'scripture study',
        'testimony', 'repentance', 'forgiveness', 'atonement', 'resurrection', 'eternal families',
        'temple work', 'missionary work', 'following christ', 'discipleship', 'gratitude',
        'patience', 'humility', 'courage', 'perseverance', 'unity', 'compassion', 'kindness'
    ]
}

/**
 * Validates questionnaire input for AI processing
 */
export async function validateQuestionnaireInput(
    questionnaire: {
        topic: string
        personalStory?: string
        customThemes?: string[]
        audienceContext?: string
        speakerAge?: string
        duration: number
        meetingType: string
    },
    context?: {
        userId?: string
        sessionId?: string
        ipAddress?: string
    }
): Promise<AIContentFilterResult & { rateLimited?: boolean }> {
    const errors: string[] = []
    const warnings: string[] = []
    const securityViolations: SecurityViolation[] = []
    let sanitizedInput = ''

    try {
        // Check rate limiting first
        if (context) {
            const rateLimitResult = await checkRateLimit(
                context.userId,
                context.ipAddress,
                context.sessionId
            )

            if (rateLimitResult.isBlocked) {
                return {
                    success: false,
                    errors: [`Rate limit exceeded. Please try again in ${rateLimitResult.blockDuration} minutes.`],
                    warnings: [],
                    securityViolations: [],
                    rateLimited: true
                }
            }
        }
        // Validate topic
        const topicResult = await validateTopic(questionnaire.topic)
        if (!topicResult.success) {
            errors.push(...topicResult.errors)
            securityViolations.push(...topicResult.securityViolations)
        } else {
            sanitizedInput += `Topic: ${topicResult.sanitizedInput}\n`
        }
        warnings.push(...topicResult.warnings)

        // Validate personal story if provided
        if (questionnaire.personalStory) {
            const storyResult = await validatePersonalStory(questionnaire.personalStory)
            if (!storyResult.success) {
                errors.push(...storyResult.errors)
                securityViolations.push(...storyResult.securityViolations)
            } else {
                sanitizedInput += `Personal Story: ${storyResult.sanitizedInput}\n`
            }
            warnings.push(...storyResult.warnings)
        }

        // Validate custom themes if provided
        if (questionnaire.customThemes && questionnaire.customThemes.length > 0) {
            const themesResult = await validateCustomThemes(questionnaire.customThemes)
            if (!themesResult.success) {
                errors.push(...themesResult.errors)
                securityViolations.push(...themesResult.securityViolations)
            } else {
                sanitizedInput += `Custom Themes: ${themesResult.sanitizedInput}\n`
            }
            warnings.push(...themesResult.warnings)
        }

        // Validate other fields
        const basicValidation = await validateBasicFields({
            audienceContext: questionnaire.audienceContext,
            speakerAge: questionnaire.speakerAge,
            duration: questionnaire.duration,
            meetingType: questionnaire.meetingType
        })

        if (!basicValidation.success) {
            errors.push(...basicValidation.errors)
        } else {
            sanitizedInput += basicValidation.sanitizedInput || ''
        }

        // Log security violations if any
        if (securityViolations.length > 0 && context) {
            await logSecurityViolationWithContext(securityViolations, {
                userInput: JSON.stringify(questionnaire),
                userId: context.userId,
                sessionId: context.sessionId,
                action: 'questionnaire_validation',
                endpoint: '/api/generate-talk'
            })
        }

        return {
            success: errors.length === 0,
            sanitizedInput: errors.length === 0 ? sanitizedInput : undefined,
            errors,
            warnings,
            securityViolations,
            rateLimited: false
        }
    } catch (error) {
        console.error('Questionnaire validation error:', error)
        return {
            success: false,
            errors: ['Failed to validate questionnaire input'],
            warnings: [],
            securityViolations: [],
            rateLimited: false
        }
    }
}

/**
 * Validates topic input
 */
async function validateTopic(topic: string): Promise<AIContentFilterResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const securityViolations: SecurityViolation[] = []

    // Sanitize input
    const sanitizeResult = await sanitizeInput(topic, 'topic', {
        allowHTML: false,
        preserveNewlines: false,
        removeSensitiveInfo: true
    })

    if (!sanitizeResult.success) {
        errors.push(...sanitizeResult.errors)
    }

    const sanitizedTopic = sanitizeResult.sanitizedValue

    // Check length
    if (!sanitizedTopic || sanitizedTopic.length < 3) {
        errors.push('Topic must be at least 3 characters long')
    }

    if (sanitizedTopic.length > AI_FILTER_CONFIG.maxLengths.topic) {
        errors.push(`Topic must be less than ${AI_FILTER_CONFIG.maxLengths.topic} characters`)
    }

    // Check for manipulation attempts
    const manipulationViolations = detectManipulationAttempts(sanitizedTopic)
    securityViolations.push(...manipulationViolations)

    // Check for inappropriate content
    const inappropriateViolations = detectInappropriateContent(sanitizedTopic)
    securityViolations.push(...inappropriateViolations)

    // Check for spam patterns
    const spamViolations = detectSpamPatterns(sanitizedTopic)
    securityViolations.push(...spamViolations)

    // Check if topic is Church-appropriate
    const isAppropriate = checkChurchAppropriate(sanitizedTopic)
    if (!isAppropriate) {
        warnings.push('Topic may not be appropriate for Church setting')
    }

    // Add critical violations to errors
    const criticalViolations = securityViolations.filter(v => v.severity === 'critical')
    if (criticalViolations.length > 0) {
        errors.push('Topic contains inappropriate content that cannot be processed')
    }

    return {
        success: errors.length === 0,
        sanitizedInput: sanitizedTopic,
        errors,
        warnings: [...warnings, ...sanitizeResult.warnings],
        securityViolations
    }
}

/**
 * Validates personal story input
 */
async function validatePersonalStory(story: string): Promise<AIContentFilterResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const securityViolations: SecurityViolation[] = []

    // Sanitize input
    const sanitizeResult = await sanitizeInput(story, 'personalStory', {
        allowHTML: false,
        preserveNewlines: true,
        removeSensitiveInfo: true
    })

    if (!sanitizeResult.success) {
        errors.push(...sanitizeResult.errors)
    }

    const sanitizedStory = sanitizeResult.sanitizedValue

    // Check length
    if (sanitizedStory.length > AI_FILTER_CONFIG.maxLengths.personalStory) {
        errors.push(`Personal story must be less than ${AI_FILTER_CONFIG.maxLengths.personalStory} characters`)
    }

    // Check for manipulation attempts
    const manipulationViolations = detectManipulationAttempts(sanitizedStory)
    securityViolations.push(...manipulationViolations)

    // Check for inappropriate content
    const inappropriateViolations = detectInappropriateContent(sanitizedStory)
    securityViolations.push(...inappropriateViolations)

    // Check for spam patterns
    const spamViolations = detectSpamPatterns(sanitizedStory)
    securityViolations.push(...spamViolations)

    // Additional security scan
    const securityScan = await scanContentSecurity(sanitizedStory)
    if (!securityScan.safe) {
        securityViolations.push({
            type: 'policy_violation',
            severity: 'high',
            description: 'Content failed security scan',
            detectedPattern: securityScan.threats.join(', '),
            timestamp: new Date()
        })
    }

    // Add critical violations to errors
    const criticalViolations = securityViolations.filter(v => v.severity === 'critical')
    if (criticalViolations.length > 0) {
        errors.push('Personal story contains inappropriate content that cannot be processed')
    }

    return {
        success: errors.length === 0,
        sanitizedInput: sanitizedStory,
        errors,
        warnings: [...warnings, ...sanitizeResult.warnings],
        securityViolations
    }
}

/**
 * Validates custom themes
 */
async function validateCustomThemes(themes: string[]): Promise<AIContentFilterResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const securityViolations: SecurityViolation[] = []
    const sanitizedThemes: string[] = []

    for (const theme of themes) {
        // Sanitize each theme
        const sanitizeResult = await sanitizeInput(theme, 'general', {
            allowHTML: false,
            preserveNewlines: false,
            removeSensitiveInfo: true
        })

        if (!sanitizeResult.success) {
            errors.push(`Invalid theme: ${theme}`)
            continue
        }

        const sanitizedTheme = sanitizeResult.sanitizedValue

        // Check length
        if (sanitizedTheme.length < 2 || sanitizedTheme.length > AI_FILTER_CONFIG.maxLengths.customTheme) {
            errors.push(`Theme "${theme}" must be between 2 and ${AI_FILTER_CONFIG.maxLengths.customTheme} characters`)
            continue
        }

        // Check for inappropriate content
        const inappropriateViolations = detectInappropriateContent(sanitizedTheme)
        securityViolations.push(...inappropriateViolations)

        // Check if theme is Church-appropriate
        const isAppropriate = checkChurchAppropriate(sanitizedTheme)
        if (!isAppropriate) {
            warnings.push(`Theme "${sanitizedTheme}" may not be appropriate for Church setting`)
        }

        // Check against known appropriate themes
        const isKnownAppropriate = AI_FILTER_CONFIG.appropriateThemes.some(appropriate =>
            sanitizedTheme.toLowerCase().includes(appropriate.toLowerCase()) ||
            appropriate.toLowerCase().includes(sanitizedTheme.toLowerCase())
        )

        if (!isKnownAppropriate) {
            warnings.push(`Theme "${sanitizedTheme}" is not in the list of recommended Church themes`)
        }

        sanitizedThemes.push(sanitizedTheme)
    }

    // Check for critical violations
    const criticalViolations = securityViolations.filter(v => v.severity === 'critical')
    if (criticalViolations.length > 0) {
        errors.push('One or more themes contain inappropriate content')
    }

    return {
        success: errors.length === 0,
        sanitizedInput: sanitizedThemes.join(', '),
        errors,
        warnings,
        securityViolations
    }
}

/**
 * Validates basic questionnaire fields
 */
async function validateBasicFields(fields: {
    audienceContext?: string
    speakerAge?: string
    duration: number
    meetingType: string
}): Promise<AIContentFilterResult> {
    const errors: string[] = []
    const warnings: string[] = []
    let sanitizedInput = ''

    // Validate duration
    if (fields.duration < 5 || fields.duration > 60) {
        errors.push('Duration must be between 5 and 60 minutes')
    } else {
        sanitizedInput += `Duration: ${fields.duration} minutes\n`
    }

    // Validate meeting type
    const validMeetingTypes = ['sacrament', 'stake_conference']
    if (!validMeetingTypes.includes(fields.meetingType)) {
        errors.push('Invalid meeting type')
    } else {
        sanitizedInput += `Meeting Type: ${fields.meetingType}\n`
    }

    // Validate audience context if provided
    if (fields.audienceContext) {
        const sanitizeResult = await sanitizeInput(fields.audienceContext, 'general')
        if (sanitizeResult.success) {
            sanitizedInput += `Audience Context: ${sanitizeResult.sanitizedValue}\n`
        } else {
            warnings.push('Audience context could not be validated')
        }
    }

    // Validate speaker age if provided
    if (fields.speakerAge) {
        const sanitizeResult = await sanitizeInput(fields.speakerAge, 'general')
        if (sanitizeResult.success) {
            sanitizedInput += `Speaker Age: ${sanitizeResult.sanitizedValue}\n`
        } else {
            warnings.push('Speaker age could not be validated')
        }
    }

    return {
        success: errors.length === 0,
        sanitizedInput,
        errors,
        warnings,
        securityViolations: []
    }
}

/**
 * Detects manipulation attempts in input
 */
function detectManipulationAttempts(input: string): SecurityViolation[] {
    const violations: SecurityViolation[] = []

    for (const pattern of AI_FILTER_CONFIG.manipulationPatterns) {
        const matches = input.match(pattern)
        if (matches) {
            violations.push({
                type: 'manipulation_attempt',
                severity: 'critical',
                description: 'Attempt to manipulate AI behavior detected',
                detectedPattern: matches[0],
                timestamp: new Date()
            })
        }
    }

    return violations
}

/**
 * Detects inappropriate content
 */
function detectInappropriateContent(input: string): SecurityViolation[] {
    const violations: SecurityViolation[] = []

    for (const pattern of AI_FILTER_CONFIG.inappropriatePatterns) {
        const matches = input.match(pattern)
        if (matches) {
            violations.push({
                type: 'inappropriate_content',
                severity: 'high',
                description: 'Inappropriate content for religious context detected',
                detectedPattern: matches[0],
                timestamp: new Date()
            })
        }
    }

    return violations
}

/**
 * Detects spam patterns
 */
function detectSpamPatterns(input: string): SecurityViolation[] {
    const violations: SecurityViolation[] = []

    for (const pattern of AI_FILTER_CONFIG.spamPatterns) {
        const matches = input.match(pattern)
        if (matches) {
            violations.push({
                type: 'spam',
                severity: 'medium',
                description: 'Spam-like content detected',
                detectedPattern: matches[0],
                timestamp: new Date()
            })
        }
    }

    return violations
}

/**
 * Checks if content is appropriate for Church setting
 */
function checkChurchAppropriate(input: string): boolean {
    const lowerInput = input.toLowerCase()

    // Check for presence of Church-related terms
    const hasChurchTerms = AI_FILTER_CONFIG.requiredElements.topic.some(term =>
        lowerInput.includes(term)
    )

    // Check for known appropriate themes
    const hasAppropriateThemes = AI_FILTER_CONFIG.appropriateThemes.some(theme =>
        lowerInput.includes(theme.toLowerCase())
    )

    return hasChurchTerms || hasAppropriateThemes
}

/**
 * Validates AI response content before delivery
 */
export async function validateAIResponse(
    response: string,
    context?: {
        userId?: string
        sessionId?: string
        ipAddress?: string
    }
): Promise<AIContentFilterResult> {
    const errors: string[] = []
    const warnings: string[] = []
    const securityViolations: SecurityViolation[] = []

    try {
        // Sanitize the response
        const sanitizeResult = await sanitizeInput(response, 'general', {
            allowHTML: false,
            preserveNewlines: true,
            removeSensitiveInfo: true
        })

        if (!sanitizeResult.success) {
            errors.push('AI response failed sanitization')
        }

        const sanitizedResponse = sanitizeResult.sanitizedValue

        // Security scan
        const securityScan = await scanContentSecurity(sanitizedResponse)
        if (!securityScan.safe) {
            securityViolations.push({
                type: 'policy_violation',
                severity: 'critical',
                description: 'AI response failed security scan',
                detectedPattern: securityScan.threats.join(', '),
                timestamp: new Date()
            })
        }

        // Check for inappropriate content in response
        const inappropriateViolations = detectInappropriateContent(sanitizedResponse)
        securityViolations.push(...inappropriateViolations)

        // Check for non-Church sources
        const nonChurchSources = detectNonChurchSources(sanitizedResponse)
        if (nonChurchSources.length > 0) {
            warnings.push(`Response contains non-Church sources: ${nonChurchSources.join(', ')}`)
        }

        // Check for doctrinal concerns
        const doctrinalConcerns = detectDoctrinalConcerns(sanitizedResponse)
        if (doctrinalConcerns.length > 0) {
            warnings.push(`Response may have doctrinal concerns: ${doctrinalConcerns.join(', ')}`)
        }

        // Log security violations if any
        if (securityViolations.length > 0 && context) {
            await logSecurityViolationWithContext(securityViolations, {
                userInput: response.substring(0, 1000), // Log first 1000 chars of response
                userId: context.userId,
                sessionId: context.sessionId,
                action: 'ai_response_validation',
                endpoint: '/api/generate-talk'
            })
        }

        return {
            success: errors.length === 0 && securityViolations.filter(v => v.severity === 'critical').length === 0,
            sanitizedInput: sanitizedResponse,
            errors,
            warnings: [...warnings, ...sanitizeResult.warnings],
            securityViolations
        }
    } catch (error) {
        console.error('AI response validation error:', error)
        return {
            success: false,
            errors: ['Failed to validate AI response'],
            warnings: [],
            securityViolations: []
        }
    }
}

/**
 * Detects non-Church sources in content
 */
function detectNonChurchSources(content: string): string[] {
    const nonChurchSources: string[] = []

    const nonChurchPatterns = [
        /\b(?:wikipedia|google|youtube|facebook|twitter|instagram|amazon|goodreads)\b/gi,
        /https?:\/\/(?!(?:www\.)?(?:churchofjesuschrist|lds)\.org)[^\s]+/gi
    ]

    for (const pattern of nonChurchPatterns) {
        const matches = content.match(pattern)
        if (matches) {
            nonChurchSources.push(...matches)
        }
    }

    return [...new Set(nonChurchSources)] // Remove duplicates
}

/**
 * Detects potential doctrinal concerns
 */
function detectDoctrinalConcerns(content: string): string[] {
    const concerns: string[] = []

    const doctrinalPatterns = [
        { pattern: /\bI believe that God\b/gi, concern: 'Personal belief stated as doctrine' },
        { pattern: /\bthe church teaches that\b/gi, concern: 'Unofficial doctrine claim' },
        { pattern: /\bGod told me\b/gi, concern: 'Personal revelation claim' },
        { pattern: /\bI received revelation\b/gi, concern: 'Personal revelation claim' }
    ]

    for (const { pattern, concern } of doctrinalPatterns) {
        if (pattern.test(content)) {
            concerns.push(concern)
        }
    }

    return concerns
}