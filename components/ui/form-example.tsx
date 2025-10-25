"use client"

import * as React from"react"
import { FormField } from"@/components/ui/form-field"
import { FormSubmit, FormContainer } from"@/components/ui/form-submit"
import { validateField, commonRules, type ValidationRule } from"@/lib/utils/form-validation"

// Example usage of the new form components
export function FormExample() {
 const [formData, setFormData] = React.useState({
 name: '',
 email: '',
 topic: '',
 duration: ''
 })

 const [errors, setErrors] = React.useState<Record<string, string>>({})
 const [isLoading, setIsLoading] = React.useState(false)

 const validationRules: Record<string, ValidationRule> = {
 name: commonRules.name,
 email: commonRules.email,
 topic: commonRules.topic,
 duration: commonRules.duration
 }

 const handleFieldChange = (name: string, value: string) => {
 setFormData(prev => ({ ...prev, [name]: value }))

 // Clear error when user starts typing
 if (errors[name]) {
 setErrors(prev => {
 const newErrors = { ...prev }
 delete newErrors[name]
 return newErrors
 })
 }
 }

 const handleFieldBlur = (name: string) => {
 const rules = validationRules[name]
 if (rules) {
 const error = validateField(formData[name as keyof typeof formData], rules)
 if (error) {
 setErrors(prev => ({ ...prev, [name]: error }))
 }
 }
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setIsLoading(true)

 // Validate all fields
 const newErrors: Record<string, string> = {}
 for (const [fieldName, rules] of Object.entries(validationRules)) {
 const error = validateField(formData[fieldName as keyof typeof formData], rules)
 if (error) {
 newErrors[fieldName] = error
 }
 }

 setErrors(newErrors)

 if (Object.keys(newErrors).length === 0) {
 // Simulate API call
 await new Promise(resolve => setTimeout(resolve, 2000))
 console.log('Form submitted:', formData)
 }

 setIsLoading(false)
 }

 return (
 <FormContainer
 loading={isLoading}
 loadingText="Submitting form..."
 onSubmit={handleSubmit}
 className="max-w-md mx-auto p-6"
 >
 <FormField
 label="Full Name"
 name="name"
 value={formData.name}
 onChange={(value) => handleFieldChange('name', value)}
 onBlur={() => handleFieldBlur('name')}
 error={errors.name}
 required
 placeholder="Enter your full name"
 />

 <FormField
 label="Email Address"
 name="email"
 type="email"
 value={formData.email}
 onChange={(value) => handleFieldChange('email', value)}
 onBlur={() => handleFieldBlur('email')}
 error={errors.email}
 required
 placeholder="Enter your email"
 />

 <FormField
 label="Talk Topic"
 name="topic"
 type="textarea"
 value={formData.topic}
 onChange={(value) => handleFieldChange('topic', value)}
 onBlur={() => handleFieldBlur('topic')}
 error={errors.topic}
 required
 placeholder="Enter the topic for your talk"
 />

 <FormField
 label="Duration (minutes)"
 name="duration"
 type="select"
 value={formData.duration}
 onChange={(value) => handleFieldChange('duration', value)}
 onBlur={() => handleFieldBlur('duration')}
 error={errors.duration}
 required
 placeholder="Select duration"
 options={[
 { value: '5', label: '5 minutes' },
 { value: '10', label: '10 minutes' },
 { value: '15', label: '15 minutes' },
 { value: '20', label: '20 minutes' }
 ]}
 />

 <FormSubmit
 loading={isLoading}
 loadingText="Submitting..."
 disabled={Object.keys(errors).length > 0}
 >
 Submit Form
 </FormSubmit>
 </FormContainer>
 )
}