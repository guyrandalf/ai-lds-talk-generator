'use client'

import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react'
import { cn } from "@/lib/utils"

// Enhanced Button with loading states
interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean
    loadingText?: string
    success?: boolean
    successText?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    progress?: number
    showProgress?: boolean
}

export function EnhancedButton({
    children,
    loading = false,
    loadingText = "Loading...",
    success = false,
    successText = "Success!",
    progress = 0,
    showProgress = false,
    disabled,
    className,
    ...props
}: EnhancedButtonProps) {
    const isDisabled = disabled || loading || success

    return (
        <div className="space-y-2">
            <Button
                {...props}
                disabled={isDisabled}
                className={cn(
                    "relative transition-all duration-200",
                    success && "bg-green-600 hover:bg-green-700",
                    className
                )}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {success && <CheckCircle className="mr-2 h-4 w-4" />}

                {loading ? loadingText : success ? successText : children}
            </Button>

            {showProgress && loading && (
                <Progress value={progress} className="h-1" />
            )}
        </div>
    )
}

// Enhanced Input with validation states
interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    success?: boolean
    loading?: boolean
    validating?: boolean
    helperText?: string
}

export function EnhancedInput({
    label,
    error,
    success,
    loading,
    validating,
    helperText,
    className,
    id,
    ...props
}: EnhancedInputProps) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
        <div className="space-y-2">
            {label && (
                <Label htmlFor={inputId} className="flex items-center gap-2">
                    {label}
                    {validating && <Loader2 className="h-3 w-3 animate-spin" />}
                </Label>
            )}

            <div className="relative">
                <Input
                    id={inputId}
                    {...props}
                    disabled={props.disabled || loading}
                    className={cn(
                        error && "border-red-500 focus-visible:ring-red-500",
                        success && "border-green-500 focus-visible:ring-green-500",
                        (loading || validating) && "opacity-50",
                        className
                    )}
                />

                {/* Status icons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {validating && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {success && !validating && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {error && !validating && <AlertCircle className="h-4 w-4 text-red-500" />}
                </div>
            </div>

            {/* Helper text or error */}
            {(error || helperText) && (
                <p className={cn(
                    "text-sm",
                    error ? "text-red-600" : "text-gray-500"
                )}>
                    {error || helperText}
                </p>
            )}
        </div>
    )
}

// Enhanced Textarea with character count and validation
interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
    success?: boolean
    loading?: boolean
    maxLength?: number
    showCharCount?: boolean
    helperText?: string
}

export function EnhancedTextarea({
    label,
    error,
    success,
    loading,
    maxLength,
    showCharCount = false,
    helperText,
    value = '',
    className,
    id,
    ...props
}: EnhancedTextareaProps) {
    const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    const charCount = String(value).length
    const isNearLimit = maxLength && charCount > maxLength * 0.8
    const isOverLimit = maxLength && charCount > maxLength

    return (
        <div className="space-y-2">
            {label && (
                <div className="flex items-center justify-between">
                    <Label htmlFor={inputId}>{label}</Label>
                    {showCharCount && maxLength && (
                        <span className={cn(
                            "text-xs",
                            isOverLimit ? "text-red-500" : isNearLimit ? "text-yellow-500" : "text-gray-500"
                        )}>
                            {charCount}/{maxLength}
                        </span>
                    )}
                </div>
            )}

            <div className="relative">
                <Textarea
                    id={inputId}
                    {...props}
                    value={value}
                    disabled={props.disabled || loading}
                    maxLength={maxLength}
                    className={cn(
                        error && "border-red-500 focus-visible:ring-red-500",
                        success && "border-green-500 focus-visible:ring-green-500",
                        loading && "opacity-50",
                        isOverLimit && "border-red-500",
                        className
                    )}
                />

                {loading && (
                    <div className="absolute right-3 top-3">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <p className={cn(
                    "text-sm",
                    error ? "text-red-600" : "text-gray-500"
                )}>
                    {error || helperText}
                </p>
            )}
        </div>
    )
}

// Multi-step form progress indicator
interface FormStepProgressProps {
    steps: string[]
    currentStep: number
    completedSteps?: number[]
    className?: string
}

export function FormStepProgress({
    steps,
    currentStep,
    completedSteps = [],
    className
}: FormStepProgressProps) {
    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                                    completedSteps.includes(index)
                                        ? "bg-green-600 text-white"
                                        : index === currentStep
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-200 text-gray-600"
                                )}
                            >
                                {completedSteps.includes(index) ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span className="text-xs mt-1 text-center max-w-16 truncate">
                                {step}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "flex-1 h-0.5 mx-2 transition-colors",
                                    completedSteps.includes(index) || index < currentStep
                                        ? "bg-green-600"
                                        : "bg-gray-200"
                                )}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

// File upload with progress
interface FileUploadProps {
    onFileSelect: (file: File) => void
    onUpload?: (file: File) => Promise<void>
    accept?: string
    maxSize?: number
    loading?: boolean
    progress?: number
    error?: string
    success?: boolean
    className?: string
}

export function FileUpload({
    onFileSelect,
    onUpload,
    accept,
    maxSize = 5 * 1024 * 1024, // 5MB default
    loading = false,
    progress = 0,
    error,
    success,
    className
}: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.size <= maxSize) {
                onFileSelect(file)
                onUpload?.(file)
            }
        }
    }, [maxSize, onFileSelect, onUpload])

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size <= maxSize) {
                onFileSelect(file)
                onUpload?.(file)
            }
        }
    }, [maxSize, onFileSelect, onUpload])

    return (
        <div className={cn("space-y-2", className)}>
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                    loading && "opacity-50",
                    error && "border-red-500 bg-red-50",
                    success && "border-green-500 bg-green-50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="space-y-2">
                    {loading ? (
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
                    ) : success ? (
                        <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                    ) : (
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    )}

                    <div>
                        <p className="text-sm font-medium">
                            {loading ? "Uploading..." : success ? "Upload complete!" : "Drop files here or click to browse"}
                        </p>
                        <p className="text-xs text-gray-500">
                            Max size: {Math.round(maxSize / 1024 / 1024)}MB
                        </p>
                    </div>
                </div>

                {loading && progress > 0 && (
                    <div className="mt-4">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    )
}

// Form section with loading skeleton
interface FormSectionProps {
    title?: string
    description?: string
    loading?: boolean
    children: React.ReactNode
    className?: string
}

export function FormSection({
    title,
    description,
    loading = false,
    children,
    className
}: FormSectionProps) {
    if (loading) {
        return (
            <div className={cn("space-y-4 p-6 bg-gray-50 rounded-xl", className)}>
                {title && <Skeleton className="h-6 w-40" />}
                {description && <Skeleton className="h-4 w-64" />}
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className={cn("space-y-4 p-6 bg-gray-50 rounded-xl", className)}>
            {title && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {description && (
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                    )}
                </div>
            )}
            {children}
        </div>
    )
}