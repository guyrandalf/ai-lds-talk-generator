import * as React from 'react'
import { BaseComponentProps, ComponentSize, DisableableProps } from './common'

// Base form field props that all form inputs should extend
export interface FormFieldProps extends BaseComponentProps, DisableableProps {
 label: string
 required?: boolean
 error?: string
 helperText?: string
 id?: string
 name?: string
}

// Props for text input components
export interface TextInputProps extends FormFieldProps {
 type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search'
 value?: string
 defaultValue?: string
 placeholder?: string
 onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
 onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
 onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void
 autoComplete?: string
 maxLength?: number
 minLength?: number
 pattern?: string
 size?: ComponentSize
}

// Props for textarea components
export interface TextareaProps extends FormFieldProps {
 value?: string
 defaultValue?: string
 placeholder?: string
 onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
 onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
 onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void
 rows?: number
 cols?: number
 maxLength?: number
 minLength?: number
 resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}

// Option type for select and multi-select components
export interface SelectOption {
 value: string
 label: string
 disabled?: boolean
 description?: string
}

// Props for select components
export interface SelectProps extends FormFieldProps {
 options: SelectOption[]
 value?: string
 defaultValue?: string
 onValueChange: (value: string) => void
 placeholder?: string
 searchable?: boolean
 clearable?: boolean
 multiple?: boolean
 size?: ComponentSize
}

// Props for multi-select components
export interface MultiSelectProps extends Omit<SelectProps, 'value' | 'onValueChange' | 'multiple' | 'defaultValue'> {
 value?: string[]
 defaultValue?: string[]
 onValueChange: (values: string[]) => void
 maxSelections?: number
}

// Props for checkbox components
export interface CheckboxProps extends Omit<FormFieldProps, 'label'> {
 checked?: boolean
 defaultChecked?: boolean
 onCheckedChange?: (checked: boolean) => void
 label?: React.ReactNode
 description?: string
 indeterminate?: boolean
}

// Props for radio group components
export interface RadioOption {
 value: string
 label: React.ReactNode
 disabled?: boolean
 description?: string
}

export interface RadioGroupProps extends FormFieldProps {
 options: RadioOption[]
 value?: string
 defaultValue?: string
 onValueChange: (value: string) => void
 orientation?: 'horizontal' | 'vertical'
}

// Props for form submission components
export interface FormSubmitProps extends BaseComponentProps {
 isSubmitting?: boolean
 submitText?: string
 submittingText?: string
 disabled?: boolean
 variant?: 'default' | 'primary' | 'secondary' | 'destructive'
 size?: ComponentSize
 onSubmit?: (event: React.FormEvent) => void
}

// Props for form validation display
export interface FormValidationProps {
 errors?: Record<string, string>
 warnings?: Record<string, string>
 touched?: Record<string, boolean>
 showErrorsFor?: string[]
}

// Props for form sections/fieldsets
export interface FormSectionProps extends BaseComponentProps {
 title?: string
 description?: string
 collapsible?: boolean
 defaultCollapsed?: boolean
 required?: boolean
}

// Props for file upload components
export interface FileUploadProps extends FormFieldProps {
 accept?: string
 multiple?: boolean
 maxSize?: number
 maxFiles?: number
 onFileSelect?: (files: File[]) => void
 onFileRemove?: (index: number) => void
 files?: File[]
 dragAndDrop?: boolean
 preview?: boolean
}

// Props for date/time input components
export interface DateTimeProps extends FormFieldProps {
 value?: Date | string
 defaultValue?: Date | string
 onChange?: (date: Date | undefined) => void
 minDate?: Date
 maxDate?: Date
 format?: string
 showTime?: boolean
 timeFormat?: '12h' | '24h'
 placeholder?: string
}