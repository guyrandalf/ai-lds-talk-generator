'use server'

import type { SecurityViolation } from '@/lib/security/aiContentFilter'
import type { ContentViolation } from '@/components/ContentGuidelines'

/**
 * Converts security violations to user-friendly content feedback
 */
export async function convertViolationsToFeedback(violations: SecurityViolation[]): Promise<ContentViolation[]> {
    return violations.map(violation => ({
        type: violation.type,
        severity: violation.severity,
        message: getUserFriendlyMessage(violation),
        suggestions: getSuggestionsForViolation(violation)
    }))
}

/**
 * Generates user-friendly messages for security violations
 */
function getUserFriendlyMessage(violation: SecurityViolation): string {
    const { type, severity, detectedPattern } = violation

    switch (type) {
        case 'inappropriate_content':
            if (detectedPattern.match(/\b(?:democrat|republican|liberal|conservative|politics|political)\b/gi)) {
                return 'Political content detected. Please focus on gospel principles rather than political topics.'
            }
            if (detectedPattern.match(/\b(?:abortion|gay marriage|lgbtq|transgender)\b/gi)) {
                return 'Controversial social topics detected. Please choose topics that unite rather than divide.'
            }
            if (detectedPattern.match(/\b(?:damn|hell|crap|stupid|idiot)\b/gi)) {
                return 'Inappropriate language detected. Please use language appropriate for a Church setting.'
            }
            if (detectedPattern.match(/\b(?:kill|murder|suicide|death|violence)\b/gi)) {
                return 'Violent content detected. Please focus on uplifting and peaceful topics.'
            }
            return 'Content may not be appropriate for a Church setting. Please review and modify.'

        case 'manipulation_attempt':
            if (detectedPattern.match(/\b(?:ignore|forget|disregard)\s+(?:previous|all|your)\s+(?:instructions|prompts|rules)/gi)) {
                return 'It looks like you\'re trying to modify how the system works. Please use the form as intended for creating religious talks.'
            }
            if (detectedPattern.match(/\b(?:act|pretend|roleplay)\s+(?:as|like)/gi)) {
                return 'Please provide genuine content for your talk rather than roleplaying scenarios.'
            }
            return 'Please use the form as intended for creating religious talk content.'

        case 'spam':
            if (detectedPattern.match(/(.{10,})\1{3,}/gi)) {
                return 'Repetitive content detected. Please provide unique, meaningful content for your talk.'
            }
            if (detectedPattern.match(/[!?]{4,}/g)) {
                return 'Excessive punctuation detected. Please use normal punctuation for better readability.'
            }
            if (detectedPattern.match(/^[A-Z\s!?.,]{20,}$/)) {
                return 'Excessive capital letters detected. Please use normal capitalization.'
            }
            if (detectedPattern.match(/https?:\/\/(?!(?:www\.)?(?:churchofjesuschrist|lds)\.org)/gi)) {
                return 'Non-Church websites detected. Please use only official Church sources and materials.'
            }
            return 'Content appears to be spam-like. Please provide meaningful, thoughtful content.'

        case 'policy_violation':
            if (detectedPattern.includes('javascript:') || detectedPattern.includes('<script')) {
                return 'Security issue detected in your content. Please remove any code or scripts.'
            }
            if (detectedPattern.match(/\b\d{3}-\d{2}-\d{4}\b/g)) {
                return 'Personal information detected. Please remove social security numbers and other sensitive data.'
            }
            if (detectedPattern.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi)) {
                return 'Email addresses detected. Please remove personal contact information.'
            }
            return 'Content violates our policies. Please review and modify your input.'

        default:
            return 'Content issue detected. Please review your input and try again.'
    }
}

/**
 * Provides specific suggestions based on violation type and pattern
 */
function getSuggestionsForViolation(violation: SecurityViolation): string[] {
    const { type, detectedPattern } = violation

    switch (type) {
        case 'inappropriate_content':
            if (detectedPattern.match(/\b(?:democrat|republican|liberal|conservative|politics|political)\b/gi)) {
                return [
                    'Focus on gospel principles like faith, hope, and charity',
                    'Share how the gospel brings unity and peace',
                    'Discuss Christ\'s teachings on love and service',
                    'Avoid partisan political topics in religious settings'
                ]
            }
            if (detectedPattern.match(/\b(?:abortion|gay marriage|lgbtq|transgender)\b/gi)) {
                return [
                    'Choose topics that focus on Christ\'s love for all people',
                    'Discuss gospel principles like compassion and understanding',
                    'Share personal experiences with faith and testimony',
                    'Focus on topics that unite rather than divide'
                ]
            }
            if (detectedPattern.match(/\b(?:damn|hell|crap|stupid|idiot)\b/gi)) {
                return [
                    'Use uplifting and respectful language',
                    'Choose words that inspire and encourage',
                    'Remember your audience includes all ages',
                    'Focus on positive, Christ-like communication'
                ]
            }
            return [
                'Focus on gospel-centered topics',
                'Share uplifting personal experiences',
                'Use language appropriate for all ages',
                'Choose topics that inspire and encourage'
            ]

        case 'manipulation_attempt':
            return [
                'Use the questionnaire to share genuine personal experiences',
                'Focus on your real spiritual journey and testimony',
                'Provide authentic stories that illustrate gospel principles',
                'Be honest and sincere in your responses'
            ]

        case 'spam':
            if (detectedPattern.match(/(.{10,})\1{3,}/gi)) {
                return [
                    'Write unique, original content for each section',
                    'Share different aspects of your testimony and experiences',
                    'Provide varied examples and stories',
                    'Make each part of your talk meaningful and distinct'
                ]
            }
            if (detectedPattern.match(/https?:\/\/(?!(?:www\.)?(?:churchofjesuschrist|lds)\.org)/gi)) {
                return [
                    'Use only official Church websites (churchofjesuschrist.org)',
                    'Reference scriptures and Church publications',
                    'Quote from General Conference talks',
                    'Use Gospel Library resources and materials'
                ]
            }
            return [
                'Write thoughtful, meaningful content',
                'Use proper grammar and punctuation',
                'Avoid repetitive or excessive formatting',
                'Focus on quality over quantity'
            ]

        case 'policy_violation':
            return [
                'Remove any personal information (SSN, phone, email)',
                'Use only text content without code or scripts',
                'Focus on spiritual and religious content only',
                'Review our content guidelines for more information'
            ]

        default:
            return [
                'Review your content for appropriateness',
                'Focus on gospel-centered topics',
                'Use respectful and uplifting language',
                'Share genuine personal experiences'
            ]
    }
}

/**
 * Generates helpful error messages for common validation errors
 */
export async function getHelpfulErrorMessage(error: string): Promise<{ message: string; suggestions: string[] }> {
    const lowerError = error.toLowerCase()

    if (lowerError.includes('topic') && lowerError.includes('required')) {
        return {
            message: 'A talk topic is required to generate your content.',
            suggestions: [
                'Choose a gospel principle like faith, hope, or charity',
                'Select a scripture or Church teaching to focus on',
                'Think about a spiritual experience you could share',
                'Consider what message would help your audience'
            ]
        }
    }

    if (lowerError.includes('topic') && lowerError.includes('short')) {
        return {
            message: 'Your topic needs to be more descriptive.',
            suggestions: [
                'Add more detail about what aspect you want to cover',
                'Explain why this topic is meaningful to you',
                'Include specific gospel principles you want to discuss',
                'Think about your main message or theme'
            ]
        }
    }

    if (lowerError.includes('personal story') && lowerError.includes('long')) {
        return {
            message: 'Your personal story is too long. Please shorten it.',
            suggestions: [
                'Focus on the most important parts of your experience',
                'Highlight the spiritual lesson or insight you gained',
                'Remove unnecessary details that don\'t support your message',
                'Keep it concise but meaningful'
            ]
        }
    }

    if (lowerError.includes('custom theme') && lowerError.includes('inappropriate')) {
        return {
            message: 'One or more of your custom themes may not be appropriate.',
            suggestions: [
                'Choose themes that focus on gospel principles',
                'Use positive, uplifting concepts',
                'Avoid controversial or divisive topics',
                'Think about what would inspire your audience'
            ]
        }
    }

    if (lowerError.includes('duration') && lowerError.includes('between')) {
        return {
            message: 'Please select a talk duration between 5 and 60 minutes.',
            suggestions: [
                'Sacrament meeting talks are typically 10-15 minutes',
                'Stake conference talks are usually 15-20 minutes',
                'Consider your audience and setting',
                'Choose a duration that fits your content'
            ]
        }
    }

    if (lowerError.includes('rate limit')) {
        return {
            message: 'You\'ve made too many requests recently. Please wait before trying again.',
            suggestions: [
                'Take time to carefully prepare your content',
                'Review the content guidelines before submitting',
                'Make sure your input follows our policies',
                'Try again in a few minutes'
            ]
        }
    }

    // Generic error handling
    return {
        message: error,
        suggestions: [
            'Review your input for any inappropriate content',
            'Make sure all fields are filled out correctly',
            'Check that your content follows our guidelines',
            'Try refreshing the page and starting over'
        ]
    }
}

/**
 * Generates success messages with tips for improvement
 */
export async function getSuccessMessageWithTips(warningCount: number = 0): Promise<{ message: string; tips?: string[] }> {
    if (warningCount === 0) {
        return {
            message: 'Great! Your content looks perfect and ready for talk generation.',
            tips: [
                'Remember to speak from the heart during your talk',
                'Practice your talk beforehand to feel confident',
                'Consider adding personal testimony at the end',
                'Pray for the Spirit to be with you as you speak'
            ]
        }
    }

    return {
        message: `Your content is ready for generation, with ${warningCount} suggestion${warningCount !== 1 ? 's' : ''} for improvement.`,
        tips: [
            'Review the suggestions to make your talk even better',
            'Consider incorporating more personal experiences',
            'Make sure your message is clear and focused',
            'Add your testimony to strengthen your talk'
        ]
    }
}

/**
 * Provides contextual help based on the current form field
 */
export async function getFieldHelp(fieldName: string): Promise<{ description: string; examples: string[] }> {
    switch (fieldName) {
        case 'topic':
            return {
                description: 'Choose a gospel-centered topic that will inspire and uplift your audience.',
                examples: [
                    'Faith in Jesus Christ',
                    'The Power of Prayer',
                    'Service and Love',
                    'Finding Peace Through the Gospel',
                    'The Importance of Scripture Study'
                ]
            }

        case 'personalStory':
            return {
                description: 'Share a meaningful personal experience that illustrates gospel principles.',
                examples: [
                    'A time when prayer helped you through a difficult situation',
                    'How scripture study strengthened your testimony',
                    'An experience serving others that taught you about Christ\'s love',
                    'A moment when you felt the Spirit guide you',
                    'How the gospel has blessed your family'
                ]
            }

        case 'customThemes':
            return {
                description: 'Add specific themes or aspects you want to emphasize in your talk.',
                examples: [
                    'Overcoming adversity',
                    'Family relationships',
                    'Missionary work',
                    'Temple worship',
                    'Following the prophet'
                ]
            }

        case 'audienceContext':
            return {
                description: 'Help us understand your audience to make your talk more relevant.',
                examples: [
                    'Local ward members who know me well',
                    'Regional conference with diverse backgrounds',
                    'Youth audience (ages 12-18)',
                    'Young single adults',
                    'Families with young children'
                ]
            }

        default:
            return {
                description: 'Provide information that will help create a meaningful, gospel-centered talk.',
                examples: []
            }
    }
}