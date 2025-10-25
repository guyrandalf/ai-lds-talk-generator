'use server'

import { z } from 'zod'

export type ValidationResult = {
 success: boolean
 error?: string
 validatedContent?: string
}

// Church domain validation
const CHURCH_DOMAINS = [
 'churchofjesuschrist.org',
 'www.churchofjesuschrist.org',
 'lds.org',
 'www.lds.org'
]

// URL validation schema
const urlSchema = z.url('Please enter a valid URL')

/**
 * Validates that a URL is from an official Church domain
 */
export async function validateChurchUrl(url: string): Promise<ValidationResult> {
 try {
 // Basic URL validation
 const validatedUrl = urlSchema.parse(url.trim())

 // Check cache first
 const { getCachedUrlValidation, setCachedUrlValidation } = await import('../cache/queryCache')
 const cachedResult = await getCachedUrlValidation(validatedUrl)

 if (cachedResult) {
 return cachedResult as ValidationResult
 }

 // Parse URL to check domain
 const urlObj = new URL(validatedUrl)
 const hostname = urlObj.hostname.toLowerCase()

 // Check if domain is from Church
 const isChurchDomain = CHURCH_DOMAINS.some(domain =>
 hostname === domain || hostname.endsWith('.' + domain)
 )

 if (!isChurchDomain) {
 const result = {
 success: false,
 error: 'URL must be from churchofjesuschrist.org or lds.org'
 }

 // Cache negative result for shorter time
 await setCachedUrlValidation(validatedUrl, result, 5 * 60) // 5 minutes
 return result
 }

 // Additional validation: check if URL is accessible (optional)
 try {
 const response = await fetch(validatedUrl, {
 method: 'HEAD',
 signal: AbortSignal.timeout(5000) // 5 second timeout
 })

 if (!response.ok) {
 const result = {
 success: false,
 error: 'URL appears to be invalid or inaccessible'
 }

 // Cache negative result for shorter time
 await setCachedUrlValidation(validatedUrl, result, 5 * 60) // 5 minutes
 return result
 }
 } catch (fetchError) {
 // If fetch fails, we'll still allow the URL but warn
 console.warn('Could not verify URL accessibility:', fetchError)
 }

 const result = {
 success: true,
 validatedContent: validatedUrl
 }

 // Cache positive result for longer time
 await setCachedUrlValidation(validatedUrl, result, 60 * 60) // 1 hour
 return result
 } catch (error) {
 if (error instanceof z.ZodError) {
 return {
 success: false,
 error: error.issues[0].message
 }
 }

 return {
 success: false,
 error: 'Invalid URL format'
 }
 }
}

/**
 * Validates multiple Church URLs
 */
export async function validateChurchUrls(urls: string[]): Promise<{
 success: boolean
 results: Array<{ url: string; valid: boolean; error?: string }>
 validUrls: string[]
}> {
 const results = []
 const validUrls = []

 for (const url of urls) {
 if (!url.trim()) {
 continue // Skip empty URLs
 }

 const result = await validateChurchUrl(url)
 results.push({
 url,
 valid: result.success,
 error: result.error
 })

 if (result.success && result.validatedContent) {
 validUrls.push(result.validatedContent)
 }
 }

 const allValid = results.every(r => r.valid)

 return {
 success: allValid,
 results,
 validUrls
 }
}

/**
 * Sanitizes user input to prevent XSS and other security issues
 */
export async function sanitizeInput(input: string): Promise<ValidationResult> {
 try {
 if (!input || typeof input !== 'string') {
 return {
 success: true,
 validatedContent: ''
 }
 }

 // Basic sanitization
 let sanitized = input.trim()

 // Remove potentially dangerous HTML tags and scripts
 sanitized = sanitized
 .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
 .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
 .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
 .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
 .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
 .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '')
 .replace(/javascript:/gi, '')
 .replace(/vbscript:/gi, '')
 .replace(/data:/gi, '')

 // Limit length to prevent abuse
 const MAX_LENGTH = 10000
 if (sanitized.length > MAX_LENGTH) {
 sanitized = sanitized.substring(0, MAX_LENGTH)
 }

 return {
 success: true,
 validatedContent: sanitized
 }
 } catch (error) {
 console.error('Sanitization error:', error)
 return {
 success: false,
 error: 'Failed to sanitize input'
 }
 }
}

/**
 * Validates and sanitizes a personal story input
 */
export async function validatePersonalStory(story: string): Promise<ValidationResult> {
 try {
 // First sanitize the input
 const sanitizeResult = await sanitizeInput(story)

 if (!sanitizeResult.success) {
 return sanitizeResult
 }

 const sanitizedStory = sanitizeResult.validatedContent || ''

 // Additional validation for personal stories
 if (sanitizedStory.length > 5000) {
 return {
 success: false,
 error: 'Personal story is too long. Please keep it under 5000 characters.'
 }
 }

 // Check for inappropriate content patterns (basic)
 const inappropriatePatterns = [
 /\b(hate|violence|inappropriate)\b/gi,
 // Add more patterns as needed
 ]

 for (const pattern of inappropriatePatterns) {
 if (pattern.test(sanitizedStory)) {
 return {
 success: false,
 error: 'Please ensure your personal story is appropriate for a Church setting.'
 }
 }
 }

 return {
 success: true,
 validatedContent: sanitizedStory
 }
 } catch (error) {
 console.error('Personal story validation error:', error)
 return {
 success: false,
 error: 'Failed to validate personal story'
 }
 }
}

/**
 * Validates scripture references format
 */
export async function validateScriptureReferences(references: string[]): Promise<{
 success: boolean
 validReferences: string[]
 errors: string[]
}> {
 const validReferences = []
 const errors = []

 // Common scripture book patterns
 const scripturePattern = /^(1|2|3)?\s*\b(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Samuel|Kings|Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation|Nephi|Jacob|Enos|Jarom|Omni|Words of Mormon|Mosiah|Alma|Helaman|Mormon|Ether|Moroni|Moses|Abraham|Joseph Smith|Articles of Faith|D&C|Doctrine and Covenants)\b.*\d+/i

 for (const reference of references) {
 if (!reference.trim()) {
 continue // Skip empty references
 }

 const sanitizeResult = await sanitizeInput(reference)
 if (!sanitizeResult.success) {
 errors.push(`Invalid reference: ${reference}`)
 continue
 }

 const sanitizedRef = sanitizeResult.validatedContent || ''

 // Basic format validation
 if (scripturePattern.test(sanitizedRef) || sanitizedRef.length < 100) {
 validReferences.push(sanitizedRef)
 } else {
 errors.push(`Invalid scripture format: ${reference}`)
 }
 }

 return {
 success: errors.length === 0,
 validReferences,
 errors
 }
}

/**
 * Comprehensive content validation for talk questionnaire
 */
export async function validateTalkContent(content: {
 topic: string
 personalStory?: string
 gospelLibraryLinks: string[]
 specificScriptures: string[]
 preferredThemes: string[]
 customThemes?: string[]
}): Promise<{
 success: boolean
 errors: string[]
 validatedContent?: {
 topic: string
 personalStory?: string
 gospelLibraryLinks: string[]
 specificScriptures: string[]
 preferredThemes: string[]
 customThemes?: string[]
 }
}> {
 const errors: string[] = []
 const validatedContent: {
 topic: string
 personalStory?: string
 gospelLibraryLinks: string[]
 specificScriptures: string[]
 preferredThemes: string[]
 customThemes?: string[]
 } = {
 topic: '',
 gospelLibraryLinks: [],
 specificScriptures: [],
 preferredThemes: [],
 customThemes: []
 }

 try {
 // Validate topic
 const topicResult = await sanitizeInput(content.topic)
 if (!topicResult.success) {
 errors.push('Invalid topic')
 } else if (!topicResult.validatedContent?.trim()) {
 errors.push('Topic is required')
 } else {
 validatedContent.topic = topicResult.validatedContent
 }

 // Validate personal story
 if (content.personalStory) {
 const storyResult = await validatePersonalStory(content.personalStory)
 if (!storyResult.success) {
 errors.push(storyResult.error || 'Invalid personal story')
 } else {
 validatedContent.personalStory = storyResult.validatedContent
 }
 }

 // Validate Gospel Library links
 const urlsResult = await validateChurchUrls(content.gospelLibraryLinks)
 if (!urlsResult.success) {
 urlsResult.results.forEach(result => {
 if (!result.valid && result.error) {
 errors.push(`Invalid link"${result.url}": ${result.error}`)
 }
 })
 }
 validatedContent.gospelLibraryLinks = urlsResult.validUrls

 // Validate scripture references
 const scripturesResult = await validateScriptureReferences(content.specificScriptures)
 if (!scripturesResult.success) {
 errors.push(...scripturesResult.errors)
 }
 validatedContent.specificScriptures = scripturesResult.validReferences

 // Validate preferred themes (simple sanitization)
 const validThemes = []
 for (const theme of content.preferredThemes) {
 const themeResult = await sanitizeInput(theme)
 if (themeResult.success && themeResult.validatedContent) {
 validThemes.push(themeResult.validatedContent)
 }
 }
 validatedContent.preferredThemes = validThemes

 // Validate custom themes with additional checks
 const validCustomThemes = []
 if (content.customThemes) {
 for (const theme of content.customThemes) {
 const themeResult = await sanitizeInput(theme)
 if (themeResult.success && themeResult.validatedContent) {
 const cleanTheme = themeResult.validatedContent.trim()

 // Additional validation for custom themes
 if (cleanTheme.length >= 2 && cleanTheme.length <= 50) {
 // Check for inappropriate content patterns
 const inappropriatePatterns = [
 /\b(politics|political|democrat|republican)\b/i,
 /\b(controversial|debate|argument)\b/i,
 /\b(hate|violence|inappropriate)\b/i
 ]

 const hasInappropriateContent = inappropriatePatterns.some(pattern =>
 pattern.test(cleanTheme)
 )

 if (!hasInappropriateContent) {
 validCustomThemes.push(cleanTheme)
 } else {
 errors.push(`Custom theme"${cleanTheme}" contains inappropriate content`)
 }
 } else {
 errors.push(`Custom theme"${cleanTheme}" must be between 2 and 50 characters`)
 }
 }
 }
 }
 validatedContent.customThemes = validCustomThemes

 return {
 success: errors.length === 0,
 errors,
 validatedContent: errors.length === 0 ? validatedContent : undefined
 }
 } catch (error) {
 console.error('Content validation error:', error)
 return {
 success: false,
 errors: ['Failed to validate content']
 }
 }
}/**
 * Va
lidates generated talk content for Church-only sources and appropriate content
 */
export async function validateGeneratedTalkContent(content: string): Promise<{
 success: boolean
 errors: string[]
 warnings: string[]
 sanitizedContent?: string
}> {
 const errors: string[] = []
 const warnings: string[] = []

 try {
 // First sanitize the content
 const sanitizeResult = await sanitizeInput(content)
 if (!sanitizeResult.success) {
 errors.push('Failed to sanitize generated content')
 return { success: false, errors, warnings }
 }

 const sanitizedContent = sanitizeResult.validatedContent || ''

 // Check for non-Church sources
 const nonChurchSourcePatterns = [
 // Common non-Church websites
 /\b(?:wikipedia|google|youtube|facebook|twitter|instagram|amazon|goodreads|deseret\.com|ldsliving\.com)\b/gi,
 // Non-Church book references
 /\b(?:book|author|published|isbn|edition)\s+(?:by|from|in)\s+(?!.*church)/gi,
 // External URLs that aren't Church domains
 /https?:\/\/(?!(?:www\.)?(?:churchofjesuschrist|lds)\.org)[^\s]+/gi
 ]

 for (const pattern of nonChurchSourcePatterns) {
 const matches = sanitizedContent.match(pattern)
 if (matches) {
 errors.push(`Generated content contains non-Church sources: ${matches.slice(0, 3).join(', ')}`)
 }
 }

 // Check for inappropriate content
 const inappropriatePatterns = [
 // Political content
 /\b(?:democrat|republican|liberal|conservative|politics|political|government|election|vote|voting)\b/gi,
 // Controversial topics
 /\b(?:controversial|debate|argument|disagree|conflict|dispute)\b/gi,
 // Personal opinions on Church policies
 /\b(?:I think the church should|the church needs to|church policy|church leadership should)\b/gi
 ]

 for (const pattern of inappropriatePatterns) {
 const matches = sanitizedContent.match(pattern)
 if (matches) {
 warnings.push(`Content may contain inappropriate topics: ${matches.slice(0, 2).join(', ')}`)
 }
 }

 // Check for doctrinal accuracy indicators
 const doctrinalConcernPatterns = [
 // Unsubstantiated claims
 /\b(?:I believe that God|the church teaches that|doctrine states)\b/gi,
 // Personal revelation claims
 /\b(?:God told me|I received revelation|the spirit revealed)\b/gi
 ]

 for (const pattern of doctrinalConcernPatterns) {
 const matches = sanitizedContent.match(pattern)
 if (matches) {
 warnings.push(`Content may need doctrinal review: ${matches.slice(0, 2).join(', ')}`)
 }
 }

 // Check for proper Church terminology
 const terminologyIssues = []
 if (sanitizedContent.includes('Mormon Church')) {
 terminologyIssues.push('Use"The Church of Jesus Christ of Latter-day Saints" instead of"Mormon Church"')
 }
 if (sanitizedContent.includes('LDS Church') && !sanitizedContent.includes('The Church of Jesus Christ')) {
 terminologyIssues.push('Consider using the full name"The Church of Jesus Christ of Latter-day Saints"')
 }

 warnings.push(...terminologyIssues)

 // Check for first-person perspective
 const firstPersonIndicators = [
 /\bI\s+(?:believe|know|testify|have learned|feel|think)\b/gi,
 /\bmy\s+(?:testimony|experience|faith|understanding)\b/gi
 ]

 let hasFirstPerson = false
 for (const pattern of firstPersonIndicators) {
 if (pattern.test(sanitizedContent)) {
 hasFirstPerson = true
 break
 }
 }

 if (!hasFirstPerson) {
 warnings.push('Content may not be written in first person as required')
 }

 // Check for testimony elements
 const testimonyPatterns = [
 /\bI\s+(?:testify|bear\s+testimony|know|believe)\b/gi,
 /\bin\s+the\s+name\s+of\s+Jesus\s+Christ/gi
 ]

 let hasTestimony = false
 for (const pattern of testimonyPatterns) {
 if (pattern.test(sanitizedContent)) {
 hasTestimony = true
 break
 }
 }

 if (!hasTestimony) {
 warnings.push('Content may be missing personal testimony elements')
 }

 // Check content length (approximate word count)
 const wordCount = sanitizedContent.split(/\s+/).length
 if (wordCount < 100) {
 errors.push('Generated content is too short')
 } else if (wordCount > 5000) {
 warnings.push('Generated content may be too long for typical talk duration')
 }

 return {
 success: errors.length === 0,
 errors,
 warnings,
 sanitizedContent: sanitizedContent
 }
 } catch (error) {
 console.error('Generated content validation error:', error)
 return {
 success: false,
 errors: ['Failed to validate generated content'],
 warnings: []
 }
 }
}

/**
 * Validates that URLs in content are from Church domains
 */
export async function validateContentUrls(content: string): Promise<{
 success: boolean
 churchUrls: string[]
 nonChurchUrls: string[]
 errors: string[]
}> {
 const churchUrls: string[] = []
 const nonChurchUrls: string[] = []
 const errors: string[] = []

 try {
 // Extract all URLs from content
 const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi
 const urls = content.match(urlPattern) || []

 for (const url of urls) {
 const cleanUrl = url.replace(/[.,;!?)]$/, '') // Remove trailing punctuation

 try {
 const urlObj = new URL(cleanUrl)
 const hostname = urlObj.hostname.toLowerCase()

 // Check if it's a Church domain
 const isChurchDomain = CHURCH_DOMAINS.some(domain =>
 hostname === domain || hostname.endsWith('.' + domain)
 )

 if (isChurchDomain) {
 churchUrls.push(cleanUrl)
 } else {
 nonChurchUrls.push(cleanUrl)
 errors.push(`Non-Church URL found: ${cleanUrl}`)
 }
 } catch {
 errors.push(`Invalid URL format: ${cleanUrl}`)
 }
 }

 return {
 success: nonChurchUrls.length === 0,
 churchUrls,
 nonChurchUrls,
 errors
 }
 } catch (error) {
 console.error('URL validation error:', error)
 return {
 success: false,
 churchUrls: [],
 nonChurchUrls: [],
 errors: ['Failed to validate URLs in content']
 }
 }
}

/**
 * Content safety filter for inappropriate or harmful content
 */
export async function applySafetyFilter(content: string): Promise<{
 success: boolean
 filteredContent?: string
 removedContent: string[]
 errors: string[]
}> {
 const removedContent: string[] = []
 const errors: string[] = []

 try {
 let filteredContent = content

 // Define patterns for content that should be removed or flagged
 const unsafePatterns = [
 // Personal information patterns
 {
 pattern: /\b\d{3}-\d{2}-\d{4}\b/g, // SSN pattern
 replacement: '[PERSONAL INFO REMOVED]',
 description: 'Social Security Number'
 },
 {
 pattern: /\b\d{3}-\d{3}-\d{4}\b/g, // Phone number pattern
 replacement: '[PHONE NUMBER REMOVED]',
 description: 'Phone Number'
 },
 {
 pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email pattern
 replacement: '[EMAIL REMOVED]',
 description: 'Email Address'
 },
 // Potentially harmful content
 {
 pattern: /\b(?:password|credit card|bank account|social security)\b[:\s]*[^\s]+/gi,
 replacement: '[SENSITIVE INFO REMOVED]',
 description: 'Sensitive Information'
 }
 ]

 // Apply safety filters
 for (const { pattern, replacement, description } of unsafePatterns) {
 const matches = filteredContent.match(pattern)
 if (matches) {
 removedContent.push(`${description}: ${matches.length} instance(s)`)
 filteredContent = filteredContent.replace(pattern, replacement)
 }
 }

 // Check for content that should trigger errors (not just warnings)
 const errorPatterns = [
 /\b(?:hate|violence|harm|hurt|kill|die|death)\s+(?:someone|people|others)\b/gi,
 /\b(?:illegal|criminal|crime|steal|theft)\b/gi
 ]

 for (const pattern of errorPatterns) {
 const matches = filteredContent.match(pattern)
 if (matches) {
 errors.push(`Potentially harmful content detected: ${matches.slice(0, 2).join(', ')}`)
 }
 }

 return {
 success: errors.length === 0,
 filteredContent: errors.length === 0 ? filteredContent : undefined,
 removedContent,
 errors
 }
 } catch (error) {
 console.error('Safety filter error:', error)
 return {
 success: false,
 removedContent: [],
 errors: ['Failed to apply safety filter']
 }
 }
}

/**
 * Comprehensive validation for generated talk content
 */
export async function validateCompleteGeneratedTalk(talk: {
 title: string
 content: string
 duration: number
}): Promise<{
 success: boolean
 errors: string[]
 warnings: string[]
 validatedTalk?: {
 title: string
 content: string
 duration: number
 }
}> {
 const errors: string[] = []
 const warnings: string[] = []

 try {
 // Validate title
 const titleResult = await sanitizeInput(talk.title)
 if (!titleResult.success || !titleResult.validatedContent?.trim()) {
 errors.push('Invalid or missing talk title')
 }

 // Validate content with comprehensive checks
 const contentValidation = await validateGeneratedTalkContent(talk.content)
 errors.push(...contentValidation.errors)
 warnings.push(...contentValidation.warnings)

 // Validate URLs in content
 const urlValidation = await validateContentUrls(talk.content)
 errors.push(...urlValidation.errors)

 // Apply safety filter
 const safetyResult = await applySafetyFilter(talk.content)
 errors.push(...safetyResult.errors)

 if (safetyResult.removedContent.length > 0) {
 warnings.push(`Content filtered: ${safetyResult.removedContent.join(', ')}`)
 }

 // Duration validation
 if (talk.duration < 5 || talk.duration > 60) {
 errors.push('Talk duration must be between 5 and 60 minutes')
 }

 // Word count vs duration check (using more realistic speaking pace)
 const wordCount = talk.content.split(/\s+/).length
 const expectedWordCount = talk.duration * 110 // ~110 words per minute (more realistic for talks)
 const wordCountDifference = Math.abs(wordCount - expectedWordCount) / expectedWordCount

 if (wordCountDifference > 0.6) { // More than 60% difference (more lenient)
 warnings.push(`Word count (${wordCount}) may not match expected duration (${talk.duration} min, ~${expectedWordCount} words)`)
 }

 const validatedTalk = {
 title: titleResult.validatedContent || talk.title,
 content: safetyResult.filteredContent || contentValidation.sanitizedContent || talk.content,
 duration: talk.duration
 }

 return {
 success: errors.length === 0,
 errors,
 warnings,
 validatedTalk: errors.length === 0 ? validatedTalk : undefined
 }
 } catch (error) {
 console.error('Complete talk validation error:', error)
 return {
 success: false,
 errors: ['Failed to validate generated talk'],
 warnings: []
 }
 }
}