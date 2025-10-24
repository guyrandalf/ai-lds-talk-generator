'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { FormLoadingOverlay } from '@/components/ui/LoadingOverlay'
import { EnhancedButton } from '@/components/ui/EnhancedFormComponents'
import CustomThemeInput from '@/components/CustomThemeInput'
import AudienceContextSelector from '@/components/AudienceContextSelector'

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
        { value: 'sacrament', label: 'Sacrament Meeting' },
        { value: 'stake_conference', label: 'Stake Conference' }
    ]

    const audienceTypes = [
        'General Congregation',
        'Youth (12-18)',
        'Young Single Adults (18-35)',
        'Adults',
        'Mixed Ages'
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

        // Validate Gospel Library links format
        const validLinks = formData.gospelLibraryLinks.filter(link => link.trim())
        for (let i = 0; i < validLinks.length; i++) {
            const link = validLinks[i]
            if (link && !link.includes('churchofjesuschrist.org')) {
                newErrors[`gospelLibraryLink_${i}`] = 'Links must be from churchofjesuschrist.org'
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
                                        onChange={(e) => handleInputChange('meetingType', e.target.value as 'sacrament' | 'stake_conference')}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={isLoading}
                                    >
                                        {meetingTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="audienceType" className="block text-sm font-medium text-gray-700 mb-2">
                                        Audience Type
                                    </label>
                                    <select
                                        id="audienceType"
                                        value={formData.audienceType}
                                        onChange={(e) => handleInputChange('audienceType', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={isLoading}
                                    >
                                        <option value="">Select audience type (optional)</option>
                                        {audienceTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
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

                        {/* Personal Story */}
                        <div className="bg-green-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Personal Touch
                            </h2>

                            <div>
                                <label htmlFor="personalStory" className="block text-sm font-medium text-gray-700 mb-2">
                                    Personal Story or Experience
                                </label>
                                <textarea
                                    id="personalStory"
                                    rows={4}
                                    required
                                    value={formData.personalStory}
                                    onChange={(e) => handleInputChange('personalStory', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                    placeholder="Share a personal experience, story, or insight related to your topic that you'd like to include in your talk..."
                                    disabled={isLoading}
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    This helps make your talk more personal and authentic.
                                </p>
                            </div>
                        </div>

                        {/* Gospel Library Links */}
                        <div className="bg-purple-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Gospel Library References
                            </h2>

                            <div className="space-y-4">
                                <p className="text-sm text-gray-600">
                                    Add links to specific talks, scriptures, or other content from the Gospel Library that you&apos;d like to reference.
                                </p>

                                {(formData.gospelLibraryLinks || []).map((link, index) => (
                                    <div key={index} className="flex gap-3">
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => handleArrayInputChange('gospelLibraryLinks', index, e.target.value)}
                                            className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${errors[`gospelLibraryLink_${index}`] ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                                                }`}
                                            placeholder="https://www.churchofjesuschrist.org/..."
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
                                    <p className="text-red-600 text-sm">All links must be from churchofjesuschrist.org</p>
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