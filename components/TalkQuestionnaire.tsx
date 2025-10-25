'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { FormLoadingOverlay } from '@/components/ui/LoadingOverlay'
import { EnhancedButton } from '@/components/ui/EnhancedFormComponents'
import CustomThemeInput from '@/components/CustomThemeInput'
import AudienceContextSelector from '@/components/AudienceContextSelector'
import PersonalStoryHelper from '@/components/PersonalStoryHelper'

import type { TalkQuestionnaire } from '@/lib/types/talks/generation'
import { BaseComponentProps, LoadingProps } from '@/lib/types/components/common'

interface TalkQuestionnaireProps extends BaseComponentProps, LoadingProps {
    onSubmit: (data: TalkQuestionnaire) => void
    initialTopic?: string
    progress?: number
    stage?: 'processing' | 'generating' | 'validating' | 'complete'
}

export default function TalkQuestionnaire({
    onSubmit,
    isLoading = false,
    initialTopic = '',
    progress = 0,
    stage = 'processing'
}: TalkQuestionnaireProps) {
    const [formData, setFormData] = useState<TalkQuestionnaire>({
        topic: initialTopic,
        duration: 15,
        meetingType: 'sacrament',
        personalStory: '',
        gospelLibraryLinks: [''],
        audienceType: '',
        speakerAge: '',
        preferredThemes: [],
        customThemes: [],
        audienceContext: '',
        specificScriptures: ['']
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const allAudienceTypes = [
        { value: 'general', label: 'General Congregation' },
        { value: 'primary', label: 'Primary (3-11)' },
        { value: 'youth', label: 'Youth (12-18)' },
        { value: 'ysa', label: 'Young Single Adults (18-35)' },
        { value: 'single_adults', label: 'Single Adults (36+)' },
        { value: 'married_adults', label: 'Married Adults' },
        { value: 'senior_adults', label: 'Senior Adults (65+)' },
        { value: 'missionaries', label: 'Missionaries' },
        { value: 'new_members', label: 'New Members' },
        { value: 'less_active', label: 'Less Active Members' }
    ]

    // Logic to determine available audience types based on meeting type
    const getAvailableAudienceTypes = (meetingType: string) => {
        switch (meetingType) {
            case 'primary':
                return allAudienceTypes.filter(type => type.value === 'primary')
            case 'young_men_women':
                return allAudienceTypes.filter(type => type.value === 'youth')
            case 'priesthood_relief_society':
                return allAudienceTypes.filter(type => ['married_adults', 'single_adults', 'senior_adults'].includes(type.value))
            case 'ysa_devotional':
                return allAudienceTypes.filter(type => type.value === 'ysa')
            case 'youth_fireside':
                return allAudienceTypes.filter(type => type.value === 'youth')
            case 'mission_conference':
                return allAudienceTypes.filter(type => type.value === 'missionaries')
            case 'senior_devotional':
                return allAudienceTypes.filter(type => type.value === 'senior_adults')
            case 'sunday_school':
                return allAudienceTypes.filter(type => ['general', 'youth', 'married_adults', 'single_adults', 'senior_adults'].includes(type.value))
            default:
                // For sacrament, stake conference, ward conference, area devotional, general fireside
                return allAudienceTypes
        }
    }

    // Auto-select audience type for certain meeting types
    const getAutoSelectedAudience = (meetingType: string) => {
        switch (meetingType) {
            case 'primary':
                return 'primary'
            case 'young_men_women':
                return 'youth'
            case 'ysa_devotional':
                return 'ysa'
            case 'youth_fireside':
                return 'youth'
            case 'mission_conference':
                return 'missionaries'
            case 'senior_devotional':
                return 'senior_adults'
            default:
                return ''
        }
    }

    const availableAudienceTypes = getAvailableAudienceTypes(formData.meetingType)
    const autoSelectedAudience = getAutoSelectedAudience(formData.meetingType)



    const getLoadingText = () => {
        switch (stage) {
            case 'processing':
                return 'Processing questionnaire...'
            case 'generating':
                return 'Generating your talk...'
            case 'validating':
                return 'Validating content...'
            case 'complete':
                return 'Complete!'
            default:
                return 'Generating your talk...'
        }
    }

    const meetingTypes = [
        // Regular Ward Meetings
        { value: 'sacrament', label: 'Sacrament Meeting', category: 'regular', enabled: true },
        { value: 'sunday_school', label: 'Sunday School', category: 'regular', enabled: false },
        { value: 'priesthood_relief_society', label: 'Priesthood/Relief Society', category: 'regular', enabled: false },
        { value: 'primary', label: 'Primary', category: 'regular', enabled: false },
        { value: 'young_men_women', label: 'Young Men/Young Women', category: 'regular', enabled: false },

        // Special Meetings
        { value: 'stake_conference', label: 'Stake Conference', category: 'special', enabled: true },
        { value: 'ward_conference', label: 'Ward Conference', category: 'special', enabled: true },
        { value: 'area_devotional', label: 'Area Conference/Devotional', category: 'special', enabled: true },
        { value: 'ysa_devotional', label: 'YSA Devotional/Fireside', category: 'special', enabled: true },
        { value: 'youth_fireside', label: 'Youth Fireside', category: 'special', enabled: true },
        { value: 'mission_conference', label: 'Mission Conference', category: 'special', enabled: true },
        { value: 'senior_devotional', label: 'Senior Devotional', category: 'special', enabled: true },
        { value: 'general_fireside', label: 'General Fireside', category: 'special', enabled: true }
    ]

    const speakerAgeRanges = [
        'Primary Child (3-11)',
        'Youth (12-18)',
        'Young Adult (18-35)',
        'Adult (36+)'
    ]

    const commonThemes = [
        'Faith',
        'Hope',
        'Charity',
        'Service',
        'Gratitude',
        'Forgiveness',
        'Repentance',
        'Testimony',
        'Family',
        'Prayer',
        'Scripture Study',
        'Discipleship',
        'Atonement',
        'Resurrection',
        'Eternal Families',
        'Missionary Work',
        'Temple Work',
        'Obedience',
        'Humility',
        'Love'
    ]

    const handleInputChange = (field: keyof TalkQuestionnaire, value: string | number | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }))
        }
    }

    // Handle meeting type change with auto-audience selection
    const handleMeetingTypeChange = (meetingType: string) => {
        const autoAudience = getAutoSelectedAudience(meetingType)

        setFormData(prev => ({
            ...prev,
            meetingType: meetingType as 'sacrament' | 'stake_conference',
            audienceType: autoAudience || prev.audienceType
        }))

        // Clear error when user changes selection
        if (errors.meetingType) {
            setErrors(prev => ({
                ...prev,
                meetingType: ''
            }))
        }
    }

    const handleArrayInputChange = (field: 'gospelLibraryLinks' | 'specificScriptures', index: number, value: string) => {
        const currentArray = formData[field] || []
        const newArray = [...currentArray]
        newArray[index] = value
        handleInputChange(field, newArray)
    }

    const addArrayInput = (field: 'gospelLibraryLinks' | 'specificScriptures') => {
        const currentArray = formData[field] || []
        const newArray = [...currentArray, '']
        handleInputChange(field, newArray)
    }

    const removeArrayInput = (field: 'gospelLibraryLinks' | 'specificScriptures', index: number) => {
        const currentArray = formData[field] || []
        const newArray = currentArray.filter((_, i) => i !== index)
        handleInputChange(field, newArray)
    }



    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.topic.trim()) {
            newErrors.topic = 'Topic is required'
        }

        if (formData.duration < 5 || formData.duration > 60) {
            newErrors.duration = 'Duration must be between 5 and 60 minutes'
        }

        if (!formData.speakerAge?.trim()) {
            newErrors.speakerAge = 'Speaker age range is required'
        }

        // STRICT REQUIREMENT: Personal story is now required
        if (!formData.personalStory?.trim()) {
            newErrors.personalStory = 'Personal story is required. Please share your own research and preparation to build your testimony.'
        }

        // STRICT REQUIREMENT: At least one Church link must be provided
        const validLinks = formData.gospelLibraryLinks.filter(link => link.trim())
        const validScriptures = formData.specificScriptures?.filter(scripture => scripture.trim()) || []

        if (validLinks.length === 0 && validScriptures.length === 0) {
            newErrors.sources = 'At least one Gospel Library link or scripture reference is required to show your preparation.'
        }

        // Validate Gospel Library links format - STRICT churchofjesuschrist.org only
        for (let i = 0; i < validLinks.length; i++) {
            const link = validLinks[i]
            if (link && !link.startsWith('https://www.churchofjesuschrist.org/')) {
                newErrors[`gospelLibraryLink_${i}`] = 'Only links from https://www.churchofjesuschrist.org/ are allowed'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fix the errors and try again.')
            return
        }

        // Clean up empty array entries
        const cleanedData = {
            ...formData,
            gospelLibraryLinks: formData.gospelLibraryLinks.filter(link => link.trim()),
            specificScriptures: formData.specificScriptures?.filter(scripture => scripture.trim()) || [],
            // Ensure custom themes are included in the data
            customThemes: formData.customThemes || [],
            audienceContext: formData.audienceContext || ''
        }

        toast.success('Processing questionnaire - preparing to generate your talk...')

        onSubmit(cleanedData)
    }

    return (
        <div className="max-w-4xl mx-auto">
            <FormLoadingOverlay isLoading={isLoading} loadingText="Generating your talk...">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalize Your Talk</h1>
                        <p className="text-gray-600 text-lg">Help us create a meaningful talk that reflects your voice and testimony</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Basic Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                                        Talk Topic *
                                    </label>
                                    <input
                                        type="text"
                                        id="topic"
                                        value={formData.topic}
                                        onChange={(e) => handleInputChange('topic', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.topic ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        placeholder="e.g., Faith, Service, Gratitude"
                                        disabled={isLoading}
                                    />
                                    {errors.topic && <p className="text-red-600 text-sm mt-1">{errors.topic}</p>}
                                </div>

                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (minutes) *
                                    </label>
                                    <input
                                        type="number"
                                        id="duration"
                                        min="5"
                                        max="60"
                                        value={formData.duration}
                                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 15)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors.duration ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                                            }`}
                                        disabled={isLoading}
                                    />
                                    {errors.duration && <p className="text-red-600 text-sm mt-1">{errors.duration}</p>}
                                </div>

                                <div>
                                    <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700 mb-2">
                                        Meeting Type *
                                    </label>
                                    <select
                                        id="meetingType"
                                        value={formData.meetingType}
                                        onChange={(e) => handleMeetingTypeChange(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={isLoading}
                                    >
                                        <optgroup label="Regular Ward Meetings">
                                            {meetingTypes.filter(type => type.category === 'regular').map(type => (
                                                <option
                                                    key={type.value}
                                                    value={type.value}
                                                    disabled={!type.enabled}
                                                    className={!type.enabled ? 'text-gray-400' : ''}
                                                >
                                                    {type.label} {!type.enabled ? '(Coming Soon)' : ''}
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Special Meetings">
                                            {meetingTypes.filter(type => type.category === 'special').map(type => (
                                                <option
                                                    key={type.value}
                                                    value={type.value}
                                                    disabled={!type.enabled}
                                                    className={!type.enabled ? 'text-gray-400' : ''}
                                                >
                                                    {type.label} {!type.enabled ? '(Coming Soon)' : ''}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="audienceType" className="block text-sm font-medium text-gray-700 mb-2">
                                        Audience Type
                                        {autoSelectedAudience && (
                                            <span className="text-sm text-blue-600 ml-2">(Auto-selected based on meeting type)</span>
                                        )}
                                    </label>
                                    <select
                                        id="audienceType"
                                        value={formData.audienceType}
                                        onChange={(e) => handleInputChange('audienceType', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={isLoading || !!autoSelectedAudience}
                                    >
                                        <option value="">Select audience type (optional)</option>
                                        {availableAudienceTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                    {autoSelectedAudience && (
                                        <p className="text-sm text-blue-600 mt-1">
                                            This meeting type automatically targets {availableAudienceTypes.find(t => t.value === autoSelectedAudience)?.label}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="speakerAge" className="block text-sm font-medium text-gray-700 mb-2">
                                        Speaker Age Range
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        id="speakerAge"
                                        value={formData.speakerAge}
                                        onChange={(e) => handleInputChange('speakerAge', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={isLoading}
                                        required
                                    >
                                        <option value="">Select your age range</option>
                                        {speakerAgeRanges.map(age => (
                                            <option key={age} value={age}>{age}</option>
                                        ))}
                                    </select>
                                    {errors.speakerAge && (
                                        <p className="text-red-500 text-sm mt-1">{errors.speakerAge}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Personal Story - Now Required */}
                        <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Story & Preparation
                                <span className="text-red-500 ml-1">*</span>
                            </h2>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                <div className="flex">
                                    <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm text-amber-800">
                                        <p className="font-medium mb-1">Why This Is Required:</p>
                                        <p>We want you to build and strengthen your own testimony through personal study and preparation. AI should enhance your prepared thoughts, not replace your spiritual preparation. Share your insights, experiences, or what you&apos;ve learned through study.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="personalStory" className="block text-sm font-medium text-gray-700 mb-2">
                                    Personal Story, Experience, or Study Insights
                                    <span className="text-red-500 ml-1">*</span>
                                </label>

                                {/* Personal Story Helper */}
                                {formData.topic && (
                                    <div className="mb-4">
                                        <PersonalStoryHelper
                                            topic={formData.topic}
                                            onSuggestionClick={(suggestion) => {
                                                const currentStory = formData.personalStory || ''
                                                const newStory = currentStory
                                                    ? `${currentStory}\n\n${suggestion}: `
                                                    : `${suggestion}: `
                                                handleInputChange('personalStory', newStory)
                                            }}
                                        />
                                    </div>
                                )}

                                <textarea
                                    id="personalStory"
                                    rows={6}
                                    required
                                    value={formData.personalStory}
                                    onChange={(e) => handleInputChange('personalStory', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${errors.personalStory ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                                        }`}
                                    placeholder="Share a personal experience, insight from your study, or story related to your topic. This shows your preparation and helps build your testimony..."
                                    disabled={isLoading}
                                />
                                {errors.personalStory && <p className="text-red-600 text-sm mt-1">{errors.personalStory}</p>}

                                <div className="text-sm text-gray-600 mt-2">
                                    <p>💡 <strong>Tip:</strong> Use the helper above for inspiration, then write in your own words about your personal experiences and insights.</p>
                                </div>
                            </div>
                        </div>

                        {/* Gospel Library Links - Now Required */}
                        <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Gospel Library References
                                <span className="text-red-500 ml-1">*</span>
                            </h2>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                <div className="flex">
                                    <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div className="text-sm text-amber-800">
                                        <p className="font-medium mb-1">STRICT REQUIREMENT:</p>
                                        <p>You must provide at least one official Church source (Gospel Library link OR scripture reference). Only links from <strong>https://www.churchofjesuschrist.org/</strong> are accepted. This ensures doctrinal accuracy and shows your preparation.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Add links to specific talks, scriptures, or other content from the Gospel Library that you&apos;ve studied and want to reference.
                                </p>

                                {errors.sources && <p className="text-red-600 text-sm font-medium">{errors.sources}</p>}

                                {(formData.gospelLibraryLinks || []).map((link, index) => (
                                    <div key={index} className="flex gap-3">
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => handleArrayInputChange('gospelLibraryLinks', index, e.target.value)}
                                            className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors[`gospelLibraryLink_${index}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                                                }`}
                                            placeholder="https://www.churchofjesuschrist.org/study/..."
                                            disabled={isLoading}
                                        />
                                        {(formData.gospelLibraryLinks?.length || 0) > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayInput('gospelLibraryLinks', index)}
                                                className="px-3 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                                                disabled={isLoading}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {(formData.gospelLibraryLinks || []).some(link => errors[`gospelLibraryLink_${(formData.gospelLibraryLinks || []).indexOf(link)}`]) && (
                                    <p className="text-red-600 text-sm">All links must be from https://www.churchofjesuschrist.org/</p>
                                )}

                                <button
                                    type="button"
                                    onClick={() => addArrayInput('gospelLibraryLinks')}
                                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    disabled={isLoading}
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Another Link
                                </button>
                            </div>
                        </div>

                        {/* Custom Theme System */}
                        <div className="bg-blue-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Talk Themes
                            </h2>

                            <p className="text-sm text-gray-600 mb-4">
                                Choose from common themes or add your own custom themes to emphasize in your talk:
                            </p>

                            <CustomThemeInput
                                predefinedThemes={commonThemes}
                                selectedThemes={[...formData.preferredThemes, ...formData.customThemes.filter(theme => formData.preferredThemes.includes(theme))]}
                                customThemes={formData.customThemes}
                                onThemeChange={(themes) => {
                                    // Separate predefined and custom themes
                                    const predefinedSelected = themes.filter(theme => commonThemes.includes(theme))
                                    const customSelected = themes.filter(theme => formData.customThemes.includes(theme))

                                    handleInputChange('preferredThemes', [...predefinedSelected, ...customSelected])
                                }}
                                onCustomThemeAdd={(theme) => {
                                    const newCustomThemes = [...formData.customThemes, theme]
                                    handleInputChange('customThemes', newCustomThemes)
                                }}
                                onCustomThemeRemove={(theme) => {
                                    const newCustomThemes = formData.customThemes.filter(t => t !== theme)
                                    handleInputChange('customThemes', newCustomThemes)
                                }}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Audience Context */}
                        <div className="bg-green-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Audience Context
                            </h2>

                            <p className="text-sm text-gray-600 mb-4">
                                Help us tailor your talk content to your specific audience and cultural context:
                            </p>

                            <AudienceContextSelector
                                selectedContext={formData.audienceContext}
                                onContextChange={(contextId) => handleInputChange('audienceContext', contextId)}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Specific Scriptures */}
                        <div className="bg-yellow-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Specific Scriptures
                            </h2>

                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    List specific scriptures you&apos;d like to reference (e.g., &quot;John 3:16&quot;, &quot;2 Nephi 2:25&quot;):
                                </p>

                                {(formData.specificScriptures || []).map((scripture, index) => (
                                    <div key={index} className="flex gap-3">
                                        <input
                                            type="text"
                                            value={scripture}
                                            onChange={(e) => handleArrayInputChange('specificScriptures', index, e.target.value)}
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="e.g., John 3:16, 2 Nephi 2:25"
                                            disabled={isLoading}
                                        />
                                        {(formData.specificScriptures?.length || 0) > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayInput('specificScriptures', index)}
                                                className="px-3 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                                                disabled={isLoading}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => addArrayInput('specificScriptures')}
                                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                    disabled={isLoading}
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Another Scripture
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-6">
                            <EnhancedButton
                                type="submit"
                                loading={isLoading}
                                loadingText={getLoadingText()}
                                progress={progress}
                                showProgress={isLoading && progress > 0}
                                size="lg"
                                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl min-h-[48px]"
                            >
                                Generate My Talk
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </EnhancedButton>
                        </div>
                    </form>
                </div>
            </FormLoadingOverlay>
        </div>
    )
}