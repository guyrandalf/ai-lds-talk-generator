"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2 } from "lucide-react"

interface FormFieldProps {
    label: string
    name: string
    type?: 'text' | 'email' | 'password' | 'textarea' | 'select'
    placeholder?: string
    value?: string
    onChange?: (value: string) => void
    onBlur?: () => void
    error?: string
    required?: boolean
    loading?: boolean
    disabled?: boolean
    options?: { value: string; label: string }[]
    className?: string
    children?: React.ReactNode
}

interface ValidationState {
    isValid: boolean
    errors: string[]
    warnings: string[]
    isValidating: boolean
}

export function FormField({
    label,
    name,
    type = 'text',
    placeholder,
    value = '',
    onChange,
    onBlur,
    error,
    required = false,
    loading = false,
    disabled = false,
    options = [],
    className,
    children
}: FormFieldProps) {
    const hasError = !!error
    const fieldId = `field-${name}`

    const renderInput = () => {
        const baseProps = {
            id: fieldId,
            name,
            value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onChange?.(e.target.value),
            onBlur,
            placeholder,
            disabled: disabled || loading,
            className: cn(
                hasError && "border-destructive focus-visible:ring-destructive",
                loading && "opacity-50"
            )
        }

        switch (type) {
            case 'textarea':
                return (
                    <Textarea
                        {...baseProps}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            onChange?.(e.target.value)}
                    />
                )

            case 'select':
                return (
                    <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
                        <SelectTrigger
                            className={cn(
                                hasError && "border-destructive focus:ring-destructive",
                                loading && "opacity-50"
                            )}
                        >
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )

            default:
                return (
                    <Input
                        {...baseProps}
                        type={type}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            onChange?.(e.target.value)}
                    />
                )
        }
    }

    return (
        <div className={cn("space-y-2", className)}>
            <Label
                htmlFor={fieldId}
                className={cn(
                    "text-sm font-medium",
                    hasError && "text-destructive",
                    required && "after:content-['*'] after:ml-0.5 after:text-destructive"
                )}
            >
                {label}
                {loading && (
                    <Loader2 className="ml-2 h-3 w-3 animate-spin inline" />
                )}
            </Label>

            <div className="relative">
                {children || renderInput()}

                {hasError && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </div>
                )}
            </div>

            {hasError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    )
}

// Hook for validation state management
export function useValidationState(initialState?: Partial<ValidationState>): [
    ValidationState,
    {
        setValid: () => void
        setInvalid: (errors: string[]) => void
        setValidating: (validating: boolean) => void
        addWarning: (warning: string) => void
        clearWarnings: () => void
        reset: () => void
    }
] {
    const [state, setState] = React.useState<ValidationState>({
        isValid: true,
        errors: [],
        warnings: [],
        isValidating: false,
        ...initialState
    })

    const actions = React.useMemo(() => ({
        setValid: () => setState(prev => ({
            ...prev,
            isValid: true,
            errors: [],
            isValidating: false
        })),

        setInvalid: (errors: string[]) => setState(prev => ({
            ...prev,
            isValid: false,
            errors,
            isValidating: false
        })),

        setValidating: (validating: boolean) => setState(prev => ({
            ...prev,
            isValidating: validating
        })),

        addWarning: (warning: string) => setState(prev => ({
            ...prev,
            warnings: [...prev.warnings, warning]
        })),

        clearWarnings: () => setState(prev => ({
            ...prev,
            warnings: []
        })),

        reset: () => setState({
            isValid: true,
            errors: [],
            warnings: [],
            isValidating: false
        })
    }), [])

    return [state, actions]
}

// Hook for form loading states
export function useFormLoading() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [loadingFields, setLoadingFields] = React.useState<Set<string>>(new Set())

    const setFieldLoading = React.useCallback((fieldName: string, loading: boolean) => {
        setLoadingFields(prev => {
            const newSet = new Set(prev)
            if (loading) {
                newSet.add(fieldName)
            } else {
                newSet.delete(fieldName)
            }
            return newSet
        })
    }, [])

    const isFieldLoading = React.useCallback((fieldName: string) => {
        return loadingFields.has(fieldName)
    }, [loadingFields])

    return {
        isLoading,
        setIsLoading,
        loadingFields,
        setFieldLoading,
        isFieldLoading,
        hasLoadingFields: loadingFields.size > 0
    }
}

export type { FormFieldProps, ValidationState }