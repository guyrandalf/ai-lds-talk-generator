'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertCircle, CheckCircle, Info, Lightbulb, X } from 'lucide-react'

export interface ContentGuidelineProps {
    showInline?: boolean
    className?: string
}

export interface ContentViolation {
    type: 'inappropriate_content' | 'manipulation_attempt' | 'spam' | 'policy_violation'
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    suggestions?: string[]
}

export interface ContentFeedbackProps {
    violations: ContentViolation[]
    onDismiss?: () => void
    showSuggestions?: boolean
}

const guidelines = [
    {
        category: 'Appropriate Topics',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        items: [
            'Faith, hope, and charity',
            'Gospel principles and doctrines',
            'Scripture study and prayer',
            'Service and discipleship',
            'Personal testimony and spiritual experiences',
            'Church history and teachings',
            'Family and eternal relationships'
        ]
    },
    {
        category: 'Content to Avoid',
        icon: <X className="h-5 w-5 text-red-600" />,
        items: [
            'Political opinions or partisan content',
            'Controversial social issues',
            'Personal attacks or criticism',
            'Inappropriate language or content',
            'Non-Church sources or references',
            'Speculative doctrine or personal theories',
            'Commercial or promotional content'
        ]
    },
    {
        category: 'Best Practices',
        icon: <Lightbulb className="h-5 w-5 text-blue-600" />,
        items: [
            'Use official Church sources and scriptures',
            'Share personal experiences appropriately',
            'Focus on Christ and His teachings',
            'Keep content appropriate for all ages',
            'Maintain a reverent and respectful tone',
            'Include personal testimony when appropriate',
            'Ensure content aligns with Church doctrine'
        ]
    }
]

const GuidelinesContent = () => (
    <div className="space-y-6">
        {guidelines.map((section, index) => (
            <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                    {section.icon}
                    <h3 className="font-semibold text-lg">{section.category}</h3>
                </div>
                <ul className="space-y-2 ml-7">
                    {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        ))}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                    <h4 className="font-medium text-blue-900">Remember</h4>
                    <p className="text-sm text-blue-800 mt-1">
                        Your talk should inspire, uplift, and help others draw closer to Christ.
                        Focus on sharing gospel truths with love and testimony.
                    </p>
                </div>
            </div>
        </div>
    </div>
)

/**
 * Content Guidelines Display Component
 */
export function ContentGuidelines({ showInline = false, className = '' }: ContentGuidelineProps) {
    const [isOpen, setIsOpen] = useState(false)

    if (showInline) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Content Guidelines
                    </CardTitle>
                    <CardDescription>
                        Follow these guidelines to create appropriate and inspiring talk content
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <GuidelinesContent />
                </CardContent>
            </Card>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={className}>
                    <Info className="h-4 w-4 mr-2" />
                    Content Guidelines
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Content Guidelines</DialogTitle>
                    <DialogDescription>
                        Follow these guidelines to create appropriate and inspiring talk content
                    </DialogDescription>
                </DialogHeader>
                <GuidelinesContent />
            </DialogContent>
        </Dialog>
    )
}

/**
 * Content Feedback Component for displaying violations and suggestions
 */
export function ContentFeedback({ violations, onDismiss, showSuggestions = true }: ContentFeedbackProps) {
    if (violations.length === 0) return null

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200'
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
            case 'high':
                return <AlertCircle className="h-4 w-4" />
            case 'medium':
            case 'low':
                return <Info className="h-4 w-4" />
            default:
                return <Info className="h-4 w-4" />
        }
    }

    const getTypeDescription = (type: string) => {
        switch (type) {
            case 'inappropriate_content':
                return 'Inappropriate Content'
            case 'manipulation_attempt':
                return 'Security Violation'
            case 'spam':
                return 'Spam-like Content'
            case 'policy_violation':
                return 'Policy Violation'
            default:
                return 'Content Issue'
        }
    }

    const getSuggestions = (type: string): string[] => {
        switch (type) {
            case 'inappropriate_content':
                return [
                    'Focus on gospel principles and Christ-centered topics',
                    'Use appropriate language suitable for all ages',
                    'Avoid controversial or divisive subjects',
                    'Share uplifting personal experiences'
                ]
            case 'manipulation_attempt':
                return [
                    'Use the form as intended for creating religious talks',
                    'Provide genuine personal stories and experiences',
                    'Focus on spiritual topics and gospel themes'
                ]
            case 'spam':
                return [
                    'Avoid repetitive text or excessive punctuation',
                    'Write meaningful, thoughtful content',
                    'Use proper grammar and sentence structure',
                    'Keep content relevant to your talk topic'
                ]
            case 'policy_violation':
                return [
                    'Review the content guidelines',
                    'Ensure all sources are from official Church materials',
                    'Keep personal information private',
                    'Focus on appropriate religious content'
                ]
            default:
                return [
                    'Review your content for appropriateness',
                    'Focus on gospel-centered topics',
                    'Use respectful and uplifting language'
                ]
        }
    }

    return (
        <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Content Issues Detected
                    </CardTitle>
                    {onDismiss && (
                        <Button variant="ghost" size="sm" onClick={onDismiss}>
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <CardDescription className="text-red-700">
                    Please review and modify your content to meet our guidelines
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {violations.map((violation, index) => (
                    <div key={index} className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${getSeverityColor(violation.severity)}`}>
                                {getSeverityIcon(violation.severity)}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={getSeverityColor(violation.severity)}>
                                        {getTypeDescription(violation.type)}
                                    </Badge>
                                    <Badge variant="secondary">
                                        {violation.severity.charAt(0).toUpperCase() + violation.severity.slice(1)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-700">{violation.message}</p>

                                {showSuggestions && violation.suggestions && violation.suggestions.length > 0 && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1">
                                            <Lightbulb className="h-4 w-4" />
                                            Suggestions
                                        </h4>
                                        <ul className="space-y-1">
                                            {violation.suggestions.map((suggestion, suggestionIndex) => (
                                                <li key={suggestionIndex} className="text-sm text-blue-800 flex items-start gap-2">
                                                    <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {showSuggestions && (!violation.suggestions || violation.suggestions.length === 0) && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-1">
                                            <Lightbulb className="h-4 w-4" />
                                            Suggestions
                                        </h4>
                                        <ul className="space-y-1">
                                            {getSuggestions(violation.type).map((suggestion, suggestionIndex) => (
                                                <li key={suggestionIndex} className="text-sm text-blue-800 flex items-start gap-2">
                                                    <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                <div className="mt-4 pt-4 border-t border-red-200">
                    <div className="flex items-center justify-between">
                        <ContentGuidelines />
                        <p className="text-sm text-red-700">
                            Need help? Review our content guidelines for more information.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

/**
 * Inline Content Tips Component
 */
export function ContentTips({ className = '' }: { className?: string }) {
    const tips = [
        'Share personal experiences that illustrate gospel principles',
        'Use scriptures and quotes from Church leaders',
        'Focus on how the gospel has blessed your life',
        'Keep your message Christ-centered and uplifting',
        'Speak from the heart with genuine testimony'
    ]

    return (
        <Card className={`bg-green-50 border-green-200 ${className}`}>
            <CardHeader className="pb-3">
                <CardTitle className="text-green-800 flex items-center gap-2 text-base">
                    <CheckCircle className="h-4 w-4" />
                    Tips for Great Content
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {tips.map((tip, index) => (
                        <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            {tip}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}

/**
 * Content Validation Status Component
 */
export function ContentValidationStatus({
    isValid,
    isValidating,
    errorCount = 0,
    warningCount = 0,
    className = ''
}: {
    isValid: boolean
    isValidating: boolean
    errorCount?: number
    warningCount?: number
    className?: string
}) {
    if (isValidating) {
        return (
            <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600" />
                Validating content...
            </div>
        )
    }

    if (isValid && errorCount === 0) {
        return (
            <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
                <CheckCircle className="h-4 w-4" />
                Content looks good!
                {warningCount > 0 && (
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                        {warningCount} suggestion{warningCount !== 1 ? 's' : ''}
                    </Badge>
                )}
            </div>
        )
    }

    return (
        <div className={`flex items-center gap-2 text-sm text-red-600 ${className}`}>
            <AlertCircle className="h-4 w-4" />
            {errorCount > 0 && (
                <>
                    {errorCount} issue{errorCount !== 1 ? 's' : ''} found
                    {warningCount > 0 && `, ${warningCount} suggestion${warningCount !== 1 ? 's' : ''}`}
                </>
            )}
        </div>
    )
}