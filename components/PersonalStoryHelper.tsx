'use client'

import { useState } from 'react'
import { Lightbulb, ChevronDown, ChevronUp, Heart, BookOpen, Users, Zap } from 'lucide-react'

interface PersonalStoryHelperProps {
    topic: string
    onSuggestionClick: (suggestion: string) => void
}

export default function PersonalStoryHelper({ topic, onSuggestionClick }: PersonalStoryHelperProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const getTopicSuggestions = (topic: string) => {
        const baseSuggestions = [
            "A time when I felt the Spirit while studying this topic",
            "How this principle has blessed my life or family",
            "A challenge I overcame by applying this gospel principle",
            "An insight I gained from scripture study about this topic",
            "How my understanding of this topic has grown over time",
            "A moment when I saw this principle in action"
        ]

        // Add topic-specific suggestions
        const topicLower = topic.toLowerCase()
        const specificSuggestions: string[] = []

        if (topicLower.includes('faith')) {
            specificSuggestions.push(
                "A time when I had to exercise faith without seeing the outcome",
                "How my faith was strengthened through a trial",
                "A prayer that was answered in an unexpected way"
            )
        } else if (topicLower.includes('service')) {
            specificSuggestions.push(
                "An opportunity to serve that blessed me more than those I served",
                "How serving others helped me understand Christ's love",
                "A time when someone's service made a difference in my life"
            )
        } else if (topicLower.includes('gratitude')) {
            specificSuggestions.push(
                "A difficult time when gratitude changed my perspective",
                "Simple blessings I often take for granted",
                "How expressing gratitude has strengthened my relationships"
            )
        } else if (topicLower.includes('family')) {
            specificSuggestions.push(
                "A family tradition that has strengthened our bonds",
                "How gospel principles have blessed my family relationships",
                "A lesson I learned from my parents or children"
            )
        } else if (topicLower.includes('prayer')) {
            specificSuggestions.push(
                "A time when prayer brought me peace during difficulty",
                "How my prayers have evolved as I've grown spiritually",
                "An answer to prayer that came in an unexpected way"
            )
        }

        return [...specificSuggestions, ...baseSuggestions].slice(0, 8)
    }

    const suggestions = getTopicSuggestions(topic)

    const categories = [
        {
            icon: <Heart className="w-4 h-4" />,
            title: "Personal Experiences",
            color: "text-red-500 bg-red-50",
            items: suggestions.slice(0, 2)
        },
        {
            icon: <BookOpen className="w-4 h-4" />,
            title: "Study Insights",
            color: "text-blue-500 bg-blue-50",
            items: suggestions.slice(2, 4)
        },
        {
            icon: <Users className="w-4 h-4" />,
            title: "Relationships & Service",
            color: "text-green-500 bg-green-50",
            items: suggestions.slice(4, 6)
        },
        {
            icon: <Zap className="w-4 h-4" />,
            title: "Spiritual Growth",
            color: "text-purple-500 bg-purple-50",
            items: suggestions.slice(6, 8)
        }
    ]

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full text-left"
            >
                <div className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                        Need help with your personal story?
                    </span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-blue-600" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                )}
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-4">
                    <p className="text-sm text-blue-800">
                        Click on any suggestion below to help you think about your personal experiences with "{topic}":
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="space-y-2">
                                <div className={`flex items-center space-x-2 p-2 rounded-lg ${category.color}`}>
                                    {category.icon}
                                    <span className="text-sm font-medium">{category.title}</span>
                                </div>

                                <div className="space-y-1">
                                    {category.items.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => onSuggestionClick(suggestion)}
                                            className="w-full text-left text-sm p-2 rounded border border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                            <strong>Remember:</strong> Your personal story doesn't need to be perfect or dramatic.
                            Simple, sincere experiences often touch hearts the most. Focus on how this topic has
                            personally impacted your life or testimony.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}