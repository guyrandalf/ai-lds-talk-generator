import * as React from"react"

export interface ValidationRule {
 required?: boolean
 minLength?: number
 maxLength?: number
 pattern?: RegExp
 email?: boolean
 custom?: (value: string) => string | null
}

export interface FieldValidation {
 value: string
 rules: ValidationRule
}

export interface FormValidationResult {
 isValid: boolean
 errors: Record<string, string>
 firstErrorField?: string
}

export function validateField(value: string, rules: ValidationRule): string | null {
 // Required validation
 if (rules.required && (!value || value.trim() === '')) {
 return 'This field is required'
 }

 // Skip other validations if field is empty and not required
 if (!value || value.trim() === '') {
 return null
 }

 // Min length validation
 if (rules.minLength && value.length < rules.minLength) {
 return `Must be at least ${rules.minLength} characters`
 }

 // Max length validation
 if (rules.maxLength && value.length > rules.maxLength) {
 return `Must be no more than ${rules.maxLength} characters`
 }

 // Email validation
 if (rules.email) {
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 if (!emailRegex.test(value)) {
 return 'Please enter a valid email address'
 }
 }

 // Pattern validation
 if (rules.pattern && !rules.pattern.test(value)) {
 return 'Please enter a valid format'
 }

 // Custom validation
 if (rules.custom) {
 return rules.custom(value)
 }

 return null
}

export function validateForm(fields: Record<string, FieldValidation>): FormValidationResult {
 const errors: Record<string, string> = {}
 let firstErrorField: string | undefined

 for (const [fieldName, { value, rules }] of Object.entries(fields)) {
 const error = validateField(value, rules)
 if (error) {
 errors[fieldName] = error
 if (!firstErrorField) {
 firstErrorField = fieldName
 }
 }
 }

 return {
 isValid: Object.keys(errors).length === 0,
 errors,
 firstErrorField
 }
}

// Common validation rules
export const commonRules = {
 required: { required: true },
 email: { required: true, email: true },
 password: { required: true, minLength: 8 },
 name: { required: true, minLength: 2, maxLength: 50 },
 topic: { required: true, minLength: 3, maxLength: 100 },
 duration: {
 required: true,
 custom: (value: string) => {
 const num = parseInt(value)
 if (isNaN(num) || num < 1 || num > 60) {
 return 'Duration must be between 1 and 60 minutes'
 }
 return null
 }
 }
}