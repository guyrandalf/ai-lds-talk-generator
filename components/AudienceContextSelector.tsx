'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Info, Globe, Users, MapPin } from 'lucide-react'

export interface AudienceContext {
    id: string
    label: string
    description: string
    culturalConsiderations: string[]
    contentGuidelines: string[]
    icon: React.ReactNode
}

interface AudienceContextSelectorProps {
    selectedContext?: string
    onContextChange: (contextId: string) => void
    disabled?: boolean
}

const audienceContexts: AudienceContext[] = [
    {
        id: 'local',
        label: 'Local Congregation',
        description: 'Speaking to your home ward or branch members who know you personally',
        culturalConsiderations: [
            'Reference local experiences and shared memories',
            'Use familiar examples from your community',
            'Include personal stories that congregation members can relate to',
            'Reference local Church leaders and activities'
        ],
        contentGuidelines: [
            'More personal and intimate tone',
            'Can reference specific ward activities or experiences',
            'Use first names when appropriate',
            'Include local cultural references that resonate'
        ],
        icon: <MapPin className="h-5 w-5" />
    },
    {
        id: 'regional',
        label: 'Regional/Stake Conference',
        description: 'Speaking to multiple wards in your stake or region with diverse backgrounds',
        culturalConsiderations: [
            'Consider diverse cultural backgrounds within your region',
            'Use examples that transcend individual ward experiences',
            'Be mindful of different socioeconomic situations',
            'Include universal gospel principles that apply broadly'
        ],
        contentGuidelines: [
            'More formal but still personal approach',
            'Focus on universal gospel themes',
            'Avoid ward-specific references',
            'Use examples that multiple communities can relate to'
        ],
        icon: <Users className="h-5 w-5" />
    },
    {
        id: 'global',
        label: 'Global/General Audience',
        description: 'Speaking to a diverse, worldwide audience with varied cultural backgrounds',
        culturalConsiderations: [
            'Avoid region-specific cultural references',
            'Use universal human experiences and emotions',
            'Be sensitive to different economic and social situations worldwide',
            'Focus on core gospel principles that transcend culture'
        ],
        contentGuidelines: [
            'Universal language and examples',
            'Avoid colloquialisms or regional expressions',
            'Use scriptures and Church leader quotes as primary references',
            'Focus on fundamental gospel truths'
        ],
        icon: <Globe className="h-5 w-5" />
    }
]

export default function AudienceContextSelector({
    selectedContext,
    onContextChange,
    disabled = false
}: AudienceContextSelectorProps) {
    const [showDetails, setShowDetails] = useState<string | null>(null)

    const handleContextSelect = (contextId: string) => {
        if (disabled) return
        onContextChange(contextId)
    }

    const toggleDetails = (contextId: string) => {
        setShowDetails(showDetails === contextId ? null : contextId)
    }

    const selectedContextData = audienceContexts.find(ctx => ctx.id === selectedContext)

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Select your target audience:
                </h3>

                <div className="grid gap-3">
                    {audienceContexts.map(context => (
                        <Card
                            key={context.id}
                            className={`cursor-pointer transition-all duration-200 ${selectedContext === context.id
                                ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200'
                                : 'hover:bg-gray-50 border-gray-200'
                                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => handleContextSelect(context.id)}
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className={`mt-0.5 ${selectedContext === context.id ? 'text-blue-600' : 'text-gray-400'
                                            }`}>
                                            {context.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium text-gray-900">{context.label}</h4>
                                                {selectedContext === context.id && (
                                                    <Check className="h-4 w-4 text-blue-600" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{context.description}</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleDetails(context.id)
                                        }}
                                        disabled={disabled}
                                        className="ml-2 h-8 w-8 p-0"
                                    >
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Expanded Details */}
                                {showDetails === context.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                Cultural Considerations:
                                            </h5>
                                            <ul className="space-y-1">
                                                {context.culturalConsiderations.map((consideration, index) => (
                                                    <li key={index} className="text-sm text-gray-600 flex items-start">
                                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                                        {consideration}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                Content Guidelines:
                                            </h5>
                                            <ul className="space-y-1">
                                                {context.contentGuidelines.map((guideline, index) => (
                                                    <li key={index} className="text-sm text-gray-600 flex items-start">
                                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                                                        {guideline}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Selected Context Summary */}
            {selectedContextData && (
                <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="text-green-600 mt-0.5">
                            {selectedContextData.icon}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-green-900 mb-1">
                                Selected Audience: {selectedContextData.label}
                            </h4>
                            <p className="text-sm text-green-700 mb-3">
                                {selectedContextData.description}
                            </p>

                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs font-medium text-green-800 mb-1">Key Focus Areas:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedContextData.contentGuidelines.slice(0, 2).map((guideline, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                {guideline}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Text */}
            <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">
                            Why does audience context matter?
                        </p>
                        <p className="text-xs text-blue-700">
                            Your audience context helps the AI generate content that resonates with your specific audience,
                            using appropriate examples, language, and cultural references that will be most meaningful and effective.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { audienceContexts }