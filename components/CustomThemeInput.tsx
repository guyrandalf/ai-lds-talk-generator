'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Check } from 'lucide-react'

interface CustomThemeInputProps {
    predefinedThemes: string[]
    selectedThemes: string[]
    customThemes: string[]
    onThemeChange: (themes: string[]) => void
    onCustomThemeAdd: (theme: string) => void
    onCustomThemeRemove: (theme: string) => void
    disabled?: boolean
}

export default function CustomThemeInput({
    predefinedThemes,
    selectedThemes,
    customThemes,
    onThemeChange,
    onCustomThemeAdd,
    onCustomThemeRemove,
    disabled = false
}: CustomThemeInputProps) {
    const [customThemeInput, setCustomThemeInput] = useState('')
    const [validationError, setValidationError] = useState('')

    const handleThemeToggle = (theme: string) => {
        if (disabled) return

        const newThemes = selectedThemes.includes(theme)
            ? selectedThemes.filter(t => t !== theme)
            : [...selectedThemes, theme]

        onThemeChange(newThemes)
    }

    const validateCustomTheme = (theme: string): { isValid: boolean; error?: string } => {
        const trimmedTheme = theme.trim()

        if (!trimmedTheme) {
            return { isValid: false, error: 'Theme cannot be empty' }
        }

        if (trimmedTheme.length < 2) {
            return { isValid: false, error: 'Theme must be at least 2 characters long' }
        }

        if (trimmedTheme.length > 50) {
            return { isValid: false, error: 'Theme must be less than 50 characters' }
        }

        // Check if theme already exists (case insensitive)
        const allExistingThemes = [...predefinedThemes, ...customThemes]
        if (allExistingThemes.some(t => t.toLowerCase() === trimmedTheme.toLowerCase())) {
            return { isValid: false, error: 'This theme already exists' }
        }

        // Check for inappropriate content (basic validation)
        const inappropriatePatterns = [
            /\b(politics|political|democrat|republican)\b/i,
            /\b(controversial|debate|argument)\b/i,
            /\b(hate|violence|inappropriate)\b/i
        ]

        for (const pattern of inappropriatePatterns) {
            if (pattern.test(trimmedTheme)) {
                return { isValid: false, error: 'Theme contains inappropriate content' }
            }
        }

        return { isValid: true }
    }

    const handleAddCustomTheme = () => {
        if (disabled) return

        const validation = validateCustomTheme(customThemeInput)

        if (!validation.isValid) {
            setValidationError(validation.error || 'Invalid theme')
            return
        }

        const trimmedTheme = customThemeInput.trim()
        onCustomThemeAdd(trimmedTheme)

        // Auto-select the newly added theme
        if (!selectedThemes.includes(trimmedTheme)) {
            onThemeChange([...selectedThemes, trimmedTheme])
        }

        setCustomThemeInput('')
        setValidationError('')
    }

    const handleCustomThemeInputChange = (value: string) => {
        setCustomThemeInput(value)
        if (validationError) {
            setValidationError('')
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddCustomTheme()
        }
    }

    const getSuggestions = (input: string): string[] => {
        if (!input.trim() || input.length < 2) return []

        const suggestions = [
            'Faith in Action',
            'Living with Purpose',
            'Finding Joy',
            'Overcoming Challenges',
            'Building Relationships',
            'Spiritual Growth',
            'Serving Others',
            'Following Christ',
            'Eternal Perspective',
            'Personal Revelation'
        ]

        return suggestions.filter(suggestion =>
            suggestion.toLowerCase().includes(input.toLowerCase()) &&
            !predefinedThemes.includes(suggestion) &&
            !customThemes.includes(suggestion)
        ).slice(0, 3)
    }

    const suggestions = getSuggestions(customThemeInput)

    return (
        <div className="space-y-4">
            {/* Predefined Themes */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Select from common themes:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {predefinedThemes.map(theme => (
                        <Button
                            key={theme}
                            type="button"
                            variant={selectedThemes.includes(theme) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleThemeToggle(theme)}
                            disabled={disabled}
                            className="justify-start text-left h-auto py-2 px-3"
                        >
                            <span className="truncate">{theme}</span>
                            {selectedThemes.includes(theme) && (
                                <Check className="ml-1 h-3 w-3 flex-shrink-0" />
                            )}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Custom Theme Input */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Add your own custom theme:
                </h3>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            type="text"
                            value={customThemeInput}
                            onChange={(e) => handleCustomThemeInputChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="e.g., Finding Peace in Trials"
                            disabled={disabled}
                            className={validationError ? 'border-red-300 focus:border-red-500' : ''}
                        />
                        {validationError && (
                            <p className="text-red-600 text-sm mt-1">{validationError}</p>
                        )}
                    </div>
                    <Button
                        type="button"
                        onClick={handleAddCustomTheme}
                        disabled={disabled || !customThemeInput.trim()}
                        size="default"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Theme Suggestions */}
                {suggestions.length > 0 && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
                        <div className="flex flex-wrap gap-1">
                            {suggestions.map(suggestion => (
                                <Button
                                    key={suggestion}
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCustomThemeInputChange(suggestion)}
                                    disabled={disabled}
                                    className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Themes Display */}
            {customThemes.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Your custom themes:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {customThemes.map(theme => (
                            <Badge
                                key={theme}
                                variant={selectedThemes.includes(theme) ? "default" : "secondary"}
                                className="cursor-pointer hover:bg-opacity-80 transition-colors"
                                onClick={() => handleThemeToggle(theme)}
                            >
                                <span className="mr-1">{theme}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onCustomThemeRemove(theme)
                                        // Remove from selected themes if it was selected
                                        if (selectedThemes.includes(theme)) {
                                            onThemeChange(selectedThemes.filter(t => t !== theme))
                                        }
                                    }}
                                    disabled={disabled}
                                    className="h-4 w-4 p-0 ml-1 hover:bg-red-100 hover:text-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Selected Themes Summary */}
            {selectedThemes.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Selected themes ({selectedThemes.length}):
                    </h4>
                    <div className="flex flex-wrap gap-1">
                        {selectedThemes.map(theme => (
                            <Badge key={theme} variant="default" className="text-xs">
                                {theme}
                            </Badge>
                        ))}
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                        These themes will be emphasized throughout your talk to create a cohesive message.
                    </p>
                </div>
            )}
        </div>
    )
}