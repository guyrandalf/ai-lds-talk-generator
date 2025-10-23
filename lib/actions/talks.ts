'use server'

import { z } from 'zod'
import { validateTalkContent } from './validation'
import { getSession } from './auth'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx'
import { sanitizeFormData } from '../security/inputSanitization'

// XAI API Configuration
const XAI_MAX_RETRIES = 3

// Types for XAI API
interface XAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Types for talk questionnaire
export interface TalkQuestionnaireData {
  topic: string
  duration: number
  meetingType: 'sacrament' | 'stake_conference'
  personalStory?: string
  gospelLibraryLinks: string[]
  audienceType?: string
  speakerAge?: string
  preferredThemes: string[]
  specificScriptures?: string[]
}

// Types for generated talk
export interface GeneratedTalk {
  id?: string
  title: string
  content: string
  duration: number
  meetingType: string
  sources: ChurchSource[]
  questionnaire: TalkQuestionnaireData
  createdAt?: Date
}

export interface ChurchSource {
  title: string
  url: string
  type: 'scripture' | 'conference_talk' | 'manual' | 'article'
}

export interface TalkPreferences {
  audienceType?: string
  preferredThemes?: string[]
  specificScriptures?: string[]
}

export interface ProcessedQuestionnaireResult {
  success: boolean
  error?: string
  data?: {
    questionnaire: TalkQuestionnaireData
    userId?: string
    sessionId: string
  }
}

// Validation schema for questionnaire
const questionnaireSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic is too long'),
  duration: z.number().min(5, 'Duration must be at least 5 minutes').max(60, 'Duration cannot exceed 60 minutes'),
  meetingType: z.enum(['sacrament', 'stake_conference'], {
    errorMap: () => ({ message: 'Please select a valid meeting type' })
  }),
  personalStory: z.string().max(5000, 'Personal story is too long').optional(),
  gospelLibraryLinks: z.array(z.string()).default([]),
  audienceType: z.string().optional(),
  speakerAge: z.string().optional(),
  preferredThemes: z.array(z.string()).default([]),
  specificScriptures: z.array(z.string()).default([])
})

/**
 * Processes and validates questionnaire data from the form
 */
export async function processQuestionnaire(formData: FormData): Promise<ProcessedQuestionnaireResult> {
  try {


    // Sanitize form data with comprehensive security checks
    const fieldConfig = {
      topic: { type: 'topic' as const, required: true },
      personalStory: { type: 'personalStory' as const, preserveNewlines: true, removeSensitiveInfo: true },
      audienceType: { type: 'general' as const },
    }

    const sanitizationResult = await sanitizeFormData(formData, fieldConfig)

    if (!sanitizationResult.success) {
      const errorMessages = Object.values(sanitizationResult.errors).flat()
      return {
        success: false,
        error: errorMessages.join('; ')
      }
    }

    // Extract and validate other form data
    const rawData = {
      topic: sanitizationResult.sanitizedData.topic,
      duration: parseInt(formData.get('duration') as string) || 15,
      meetingType: formData.get('meetingType') as 'sacrament' | 'stake_conference',
      personalStory: sanitizationResult.sanitizedData.personalStory || undefined,
      audienceType: sanitizationResult.sanitizedData.audienceType || undefined,
      speakerAge: formData.get('speakerAge') as string || undefined,
      gospelLibraryLinks: formData.getAll('gospelLibraryLinks') as string[],
      preferredThemes: formData.getAll('preferredThemes') as string[],
      specificScriptures: formData.getAll('specificScriptures') as string[]
    }

    // Basic schema validation
    const validatedData = questionnaireSchema.parse(rawData)

    // Advanced content validation
    const contentValidation = await validateTalkContent({
      topic: validatedData.topic,
      personalStory: validatedData.personalStory,
      gospelLibraryLinks: validatedData.gospelLibraryLinks,
      specificScriptures: validatedData.specificScriptures,
      preferredThemes: validatedData.preferredThemes
    })

    if (!contentValidation.success) {
      return {
        success: false,
        error: contentValidation.errors.join('; ')
      }
    }

    // Get user session (if authenticated)
    const session = await getSession()

    // Create processed questionnaire data
    const processedData: TalkQuestionnaireData = {
      topic: contentValidation.validatedContent!.topic,
      duration: validatedData.duration,
      meetingType: validatedData.meetingType,
      personalStory: contentValidation.validatedContent!.personalStory,
      gospelLibraryLinks: contentValidation.validatedContent!.gospelLibraryLinks,
      audienceType: validatedData.audienceType,
      preferredThemes: contentValidation.validatedContent!.preferredThemes,
      specificScriptures: contentValidation.validatedContent!.specificScriptures
    }

    // Generate session ID for tracking this questionnaire
    const sessionId = generateSessionId()

    return {
      success: true,
      data: {
        questionnaire: processedData,
        userId: session?.userId,
        sessionId
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      }
    }

    console.error('Questionnaire processing error:', error)
    return {
      success: false,
      error: 'Failed to process questionnaire. Please check your inputs and try again.'
    }
  }
}

/**
 * Processes questionnaire data from JavaScript object (for client-side forms)
 */
export async function processQuestionnaireData(data: TalkQuestionnaireData): Promise<ProcessedQuestionnaireResult> {
  try {
    // Basic schema validation
    const validatedData = questionnaireSchema.parse(data)

    // Advanced content validation
    const contentValidation = await validateTalkContent({
      topic: validatedData.topic,
      personalStory: validatedData.personalStory,
      gospelLibraryLinks: validatedData.gospelLibraryLinks,
      specificScriptures: validatedData.specificScriptures,
      preferredThemes: validatedData.preferredThemes
    })

    if (!contentValidation.success) {
      return {
        success: false,
        error: contentValidation.errors.join('; ')
      }
    }

    // Get user session (if authenticated)
    const session = await getSession()

    // Create processed questionnaire data
    const processedData: TalkQuestionnaireData = {
      topic: contentValidation.validatedContent!.topic,
      duration: validatedData.duration,
      meetingType: validatedData.meetingType,
      personalStory: contentValidation.validatedContent!.personalStory,
      gospelLibraryLinks: contentValidation.validatedContent!.gospelLibraryLinks,
      audienceType: validatedData.audienceType,
      preferredThemes: contentValidation.validatedContent!.preferredThemes,
      specificScriptures: contentValidation.validatedContent!.specificScriptures
    }

    // Generate session ID for tracking this questionnaire
    const sessionId = generateSessionId()

    return {
      success: true,
      data: {
        questionnaire: processedData,
        userId: session?.userId,
        sessionId
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      }
    }

    console.error('Questionnaire processing error:', error)
    return {
      success: false,
      error: 'Failed to process questionnaire. Please check your inputs and try again.'
    }
  }
}

/**
 * Stores questionnaire data temporarily for talk generation
 * This will be used to pass data to the AI generation service
 */
export async function storeQuestionnaireForGeneration(
  sessionId: string,
  questionnaire: TalkQuestionnaireData,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // In a real implementation, you might store this in:
    // 1. Redis for temporary storage
    // 2. Database with expiration
    // 3. In-memory cache
    // 
    // For now, we'll simulate storage and return success
    // The actual implementation would depend on your caching strategy

    console.log('Storing questionnaire for generation:', {
      sessionId,
      userId,
      topic: questionnaire.topic,
      duration: questionnaire.duration,
      meetingType: questionnaire.meetingType
    })

    // Validate required fields one more time
    if (!questionnaire.topic || !questionnaire.duration || !questionnaire.meetingType) {
      return {
        success: false,
        error: 'Missing required questionnaire data'
      }
    }

    // Here you would implement actual storage logic
    // For example:
    // await redis.setex(`questionnaire:${sessionId}`, 3600, JSON.stringify({
    //   questionnaire,
    //   userId,
    //   timestamp: Date.now()
    // }))

    return { success: true }
  } catch (error) {
    console.error('Failed to store questionnaire:', error)
    return {
      success: false,
      error: 'Failed to store questionnaire data'
    }
  }
}

/**
 * Retrieves stored questionnaire data for talk generation
 */
export async function getStoredQuestionnaire(sessionId: string): Promise<{
  success: boolean
  data?: {
    questionnaire: TalkQuestionnaireData
    userId?: string
    timestamp: number
  }
  error?: string
}> {
  try {
    // In a real implementation, retrieve from your storage system
    // For now, we'll return a placeholder response

    console.log('Retrieving questionnaire for session:', sessionId)

    // Here you would implement actual retrieval logic
    // For example:
    // const stored = await redis.get(`questionnaire:${sessionId}`)
    // if (!stored) {
    //   return { success: false, error: 'Questionnaire not found or expired' }
    // }
    // return { success: true, data: JSON.parse(stored) }

    return {
      success: false,
      error: 'Questionnaire storage not yet implemented'
    }
  } catch (error) {
    console.error('Failed to retrieve questionnaire:', error)
    return {
      success: false,
      error: 'Failed to retrieve questionnaire data'
    }
  }
}

/**
 * Validates questionnaire completeness for talk generation
 */
export async function validateQuestionnaireForGeneration(questionnaire: TalkQuestionnaireData): Promise<{
  success: boolean
  errors: string[]
  warnings: string[]
}> {
  const errors: string[] = []
  const warnings: string[] = []

  // Required field validation
  if (!questionnaire.topic?.trim()) {
    errors.push('Topic is required')
  }

  if (!questionnaire.duration || questionnaire.duration < 5 || questionnaire.duration > 60) {
    errors.push('Duration must be between 5 and 60 minutes')
  }

  if (!questionnaire.meetingType) {
    errors.push('Meeting type is required')
  }

  // Optional field warnings
  if (!questionnaire.personalStory?.trim()) {
    warnings.push('Consider adding a personal story to make your talk more engaging')
  }

  if (questionnaire.gospelLibraryLinks.length === 0) {
    warnings.push('Adding Gospel Library references can strengthen your talk')
  }

  if (questionnaire.preferredThemes.length === 0) {
    warnings.push('Selecting preferred themes can help focus your talk')
  }

  // Content quality checks
  if (questionnaire.topic.length < 3) {
    warnings.push('Topic seems very short - consider being more specific')
  }

  if (questionnaire.personalStory && questionnaire.personalStory.length < 50) {
    warnings.push('Personal story is quite short - consider adding more detail')
  }

  return {
    success: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Generates a unique session ID for tracking questionnaire data
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  return `quest_${timestamp}_${randomPart}`
}

/**
 * Makes a direct call to XAI API using fetch (like your working project)
 */
async function callXaiAPI(messages: XAIMessage[], options: {
  maxTokens?: number
  temperature?: number
} = {}): Promise<{ success: boolean; content?: string; error?: string }> {
  const { maxTokens = 4000, temperature = 0.7 } = options

  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages,
        model: 'grok-2-1212',
        stream: false,
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`XAI API error ${response.status}:`, errorText)
      return {
        success: false,
        error: `XAI API error: ${response.status} - ${errorText}`
      }
    }

    const result = await response.json()
    const content = result.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return {
        success: false,
        error: "No content received from XAI API"
      }
    }

    return {
      success: true,
      content
    }
  } catch (error) {
    console.error('XAI API call failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Makes a request to XAI API with retry logic and error handling
 */
async function makeXAIRequest(
  messages: XAIMessage[],
  options: {
    maxTokens?: number
    temperature?: number
    retries?: number
  } = {}
): Promise<{ success: boolean; content?: string; error?: string; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
  const { maxTokens = 4000, temperature = 0.7, retries = XAI_MAX_RETRIES } = options

  // Validate message content length
  const totalContentLength = messages.reduce((sum, msg) => sum + msg.content.length, 0)
  if (totalContentLength > 100000) { // Reasonable limit
    return {
      success: false,
      error: `Message content too long: ${totalContentLength} characters`
    }
  }

  console.log('Starting XAI API request')
  console.log('Messages count:', messages.length)
  console.log('Total content length:', totalContentLength)

  for (let attempt = 1; attempt <= retries; attempt++) {
    console.log(`XAI API request attempt ${attempt}/${retries}`)

    const result = await callXaiAPI(messages, { maxTokens, temperature })

    if (result.success) {
      console.log('XAI API request successful', {
        contentLength: result.content?.length
      })
      return {
        success: true,
        content: result.content
      }
    }

    console.error(`XAI API request failed (attempt ${attempt}/${retries}):`, result.error)

    // Don't retry on authentication errors (401/403)
    if (result.error?.includes('401') || result.error?.includes('403')) {
      return {
        success: false,
        error: `Authentication failed: ${result.error}`
      }
    }

    // Don't retry on rate limit errors (429)
    if (result.error?.includes('429')) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      }
    }

    // If this was the last attempt, return the error
    if (attempt === retries) {
      return {
        success: false,
        error: `XAI API error after ${retries} attempts: ${result.error}`
      }
    }

    // Wait before retrying (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000) // Max 10 seconds
    console.log(`Waiting ${delay}ms before retry...`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  return {
    success: false,
    error: 'Unknown error occurred'
  }
}

/**
 * Validates XAI API configuration (DEPRECATED - no longer used)
 * We now just check for the API key presence and use it directly
 */
// Commented out to avoid unnecessary API calls during validation
// export async function validateXAIConfiguration(): Promise<{
//   success: boolean
//   error?: string
// }> {
//   // This function has been deprecated to avoid unnecessary API calls
//   // We now just check if the API key exists and use it directly
// }

/**
 * Formats questionnaire data for AI prompt generation with structured prompts
 */
export async function formatQuestionnaireForAI(questionnaire: TalkQuestionnaireData): Promise<{
  success: boolean
  formattedPrompt?: string
  error?: string
}> {
  try {
    const validation = await validateQuestionnaireForGeneration(questionnaire)

    if (!validation.success) {
      return {
        success: false,
        error: `Questionnaire validation failed: ${validation.errors.join(', ')}`
      }
    }

    // Calculate approximate word count for the duration (average 110 words per minute for talks)
    const targetWordCount = Math.round(questionnaire.duration * 110)

    // Create structured prompt sections
    const promptSections = []

    // Main request
    promptSections.push(`TALK REQUEST:
Generate a ${questionnaire.duration}-minute ${questionnaire.meetingType.replace('_', ' ')} talk on "${questionnaire.topic}".
Target length: approximately ${targetWordCount} words.
Speaker age range: ${questionnaire.speakerAge || 'Adult'}`)

    // Meeting context
    if (questionnaire.meetingType === 'sacrament') {
      promptSections.push(`MEETING CONTEXT:
This is for a sacrament meeting. Focus on:
- Spiritual edification and personal testimony
- Doctrinal principles that strengthen faith
- Personal application for daily living
- Appropriate for all ages including children`)
    } else {
      promptSections.push(`MEETING CONTEXT:
This is for a stake conference. Focus on:
- Broader audience from multiple wards
- More formal but still personal tone
- Universal gospel principles
- Inspiring and uplifting message`)
    }

    // Audience specification
    if (questionnaire.audienceType) {
      promptSections.push(`AUDIENCE: ${questionnaire.audienceType}`)
    }

    // Speaker age-specific guidance
    if (questionnaire.speakerAge) {
      let ageGuidance = ''

      if (questionnaire.speakerAge.includes('Primary Child')) {
        ageGuidance = `SPEAKER AGE GUIDANCE:
The speaker is a Primary child (3-11 years old). Please:
- Use simple, age-appropriate language and concepts
- Keep sentences short and clear
- Focus on basic gospel principles they can understand
- Include simple examples from their daily life
- Avoid complex doctrinal discussions
- Use first person but in a way that sounds natural for a child
- If no personal story is provided, reference simple, relatable experiences like family prayers, helping others, or feeling the Spirit during Primary`
      } else if (questionnaire.speakerAge.includes('Youth')) {
        ageGuidance = `SPEAKER AGE GUIDANCE:
The speaker is a youth (12-18 years old). Please:
- Use language appropriate for teenagers
- Include examples relevant to youth experiences (school, friends, seminary, mutual activities)
- Focus on gospel principles that help with teenage challenges
- Use first person in a way that sounds authentic for a young person
- If no personal story is provided, reference experiences like seminary lessons, youth activities, service projects, or testimony-building moments
- Avoid overly mature language or experiences that don't fit their age`
      } else if (questionnaire.speakerAge.includes('Young Adult')) {
        ageGuidance = `SPEAKER AGE GUIDANCE:
The speaker is a young adult (18-35 years old). Please:
- Use contemporary but reverent language
- Include examples relevant to young adult experiences (college, career, dating, marriage, early parenthood)
- Focus on gospel principles for life transitions and building testimonies
- If no personal story is provided, reference experiences like mission service, institute, young adult activities, or early adult challenges`
      } else {
        ageGuidance = `SPEAKER AGE GUIDANCE:
The speaker is an adult (36+ years old). Please:
- Use mature, thoughtful language appropriate for an experienced adult
- Include examples from adult life experiences
- Draw on deeper gospel understanding and life lessons
- If no personal story is provided, reference experiences like parenting, career challenges, service in callings, or life's trials and blessings`
      }

      promptSections.push(ageGuidance)
    }

    // Personal story integration
    if (questionnaire.personalStory?.trim()) {
      promptSections.push(`PERSONAL STORY TO INCORPORATE:
"${questionnaire.personalStory.trim()}"

Please weave this personal experience naturally into the talk, using it to illustrate gospel principles and connect with the audience.`)
    } else {
      promptSections.push(`PERSONAL EXPERIENCE GUIDANCE:
Since no specific personal story was provided, please:
- Reference appropriate experiences from Church leaders' talks and teachings
- Use general but relatable examples that fit the speaker's age range
- Include references to common spiritual experiences (feeling the Spirit, answered prayers, scripture study insights)
- Avoid creating fictional personal experiences - instead draw from general Church leader experiences and teachings
- Make it feel personal through testimony and application rather than invented stories`)
    }

    // Gospel Library references
    if (questionnaire.gospelLibraryLinks.length > 0) {
      promptSections.push(`GOSPEL LIBRARY REFERENCES TO INCLUDE:
${questionnaire.gospelLibraryLinks.map(link => `- ${link}`).join('\n')}

Please reference and quote from these sources, ensuring they support your main points.`)
    }

    // Specific scriptures
    if (questionnaire.specificScriptures && questionnaire.specificScriptures.length > 0) {
      promptSections.push(`SCRIPTURES TO REFERENCE:
${questionnaire.specificScriptures.map(scripture => `- ${scripture}`).join('\n')}

Include these scriptures with context and application to the topic.`)
    }

    // Preferred themes
    if (questionnaire.preferredThemes.length > 0) {
      promptSections.push(`THEMES TO EMPHASIZE:
${questionnaire.preferredThemes.map(theme => `- ${theme}`).join('\n')}

Weave these themes throughout the talk to create a cohesive message.`)
    }

    // Talk structure requirements
    promptSections.push(`TALK STRUCTURE REQUIREMENTS:

1. OPENING (1-2 minutes):
   - Warm greeting and connection with audience
   - Clear introduction of the topic
   - Brief preview of what will be shared

2. MAIN CONTENT (${Math.max(1, questionnaire.duration - 4)}-${questionnaire.duration - 2} minutes):
   - 2-3 main points that develop the topic
   - Scripture references and quotes from Church leaders
   - Personal stories and applications
   - Smooth transitions between points
   - Practical applications for daily life

3. TESTIMONY AND CLOSING (1-2 minutes):
   - Personal testimony related to the topic
   - Invitation for audience to apply principles
   - Closing in the name of Jesus Christ

WRITING STYLE:
- First person perspective throughout ("I believe...", "I have learned...", "I testify...")
- Conversational but reverent tone
- Natural flow as if speaking to friends and family
- Include pauses and transitions ("Now, let me share...", "As I've pondered this...")
- Personal and authentic voice`)

    // Content restrictions
    promptSections.push(`CONTENT RESTRICTIONS:
- Use ONLY official Church content from churchofjesuschrist.org
- Reference scriptures, conference talks, Church manuals, and official publications
- No external books, websites, or non-Church sources
- Keep all content doctrinally sound and appropriate
- Avoid controversial topics or personal opinions on Church policies`)

    // Final formatting instructions
    promptSections.push(`FORMATTING:
Please provide a clear title for the talk, followed by the complete talk content with proper paragraph breaks and smooth transitions.`)

    const formattedPrompt = promptSections.join('\n\n')

    return {
      success: true,
      formattedPrompt
    }
  } catch (error) {
    console.error('Failed to format questionnaire for AI:', error)
    return {
      success: false,
      error: 'Failed to format questionnaire data'
    }
  }
}
/**

 * Generates a talk using XAI API based on questionnaire data
 */
export async function generateTalk(questionnaire: TalkQuestionnaireData): Promise<{
  success: boolean
  talk?: GeneratedTalk
  error?: string
  warnings?: string[]
}> {
  try {
    console.log('Starting talk generation for topic:', questionnaire.topic)

    // Validate questionnaire
    const validation = await validateQuestionnaireForGeneration(questionnaire)
    if (!validation.success) {
      return {
        success: false,
        error: `Questionnaire validation failed: ${validation.errors.join(', ')}`,
        warnings: validation.warnings
      }
    }

    // Check if XAI API key is configured
    if (!process.env.XAI_API_KEY) {
      return {
        success: false,
        error: 'XAI API key is not configured. Please set XAI_API_KEY environment variable.'
      }
    }

    // Format questionnaire for AI prompt
    const promptResult = await formatQuestionnaireForAI(questionnaire)
    if (!promptResult.success) {
      return {
        success: false,
        error: promptResult.error
      }
    }

    // Create system message for talk generation
    const systemMessage: XAIMessage = {
      role: 'system',
      content: `You are an expert at writing LDS sacrament meeting and stake conference talks. You help members of The Church of Jesus Christ of Latter-day Saints create meaningful, doctrinally sound talks.

CRITICAL REQUIREMENTS:
1. Write in first person as if the speaker is delivering personally
2. Use ONLY official Church content from churchofjesuschrist.org domain
3. Include smooth transitions between sections
4. Structure: Introduction → Main points → Personal application → Testimony
5. End with personal testimony
6. Make it feel authentic and personal to the speaker
7. Include specific scripture references and quotes from Church leaders
8. Ensure the talk flows naturally when spoken aloud

CONTENT RESTRICTIONS:
- Only reference content from churchofjesuschrist.org
- No external sources, books, or non-Church materials
- Focus on doctrine, principles, and spiritual application
- Keep content appropriate for all ages in a Church setting

RESPONSE FORMAT:
Provide the talk content in a clear, readable format with proper paragraphs and transitions. Include a suggested title at the beginning.`
    }

    // Create user message with the formatted prompt
    const userMessage: XAIMessage = {
      role: 'user',
      content: promptResult.formattedPrompt!
    }

    // Make request to XAI API
    console.log('Sending request to XAI API...')
    const aiResult = await makeXAIRequest([systemMessage, userMessage], {
      maxTokens: 4000,
      temperature: 0.7
    })

    if (!aiResult.success) {
      return {
        success: false,
        error: `AI generation failed: ${aiResult.error}`
      }
    }

    // Process the AI response
    const generatedContent = aiResult.content!

    // Extract title and content with improved parsing
    const processedContent = processAIResponse(generatedContent, questionnaire.topic)

    // Extract Church sources from the content
    const extractedSources = extractChurchSources(processedContent.content)

    // Validate generated content with comprehensive safety checks
    const { validateCompleteGeneratedTalk } = await import('./validation')
    const contentValidation = await validateCompleteGeneratedTalk({
      title: processedContent.title,
      content: processedContent.content,
      duration: questionnaire.duration
    })

    if (!contentValidation.success) {
      console.error('Generated content validation failed:', contentValidation.errors)
      return {
        success: false,
        error: `Generated content validation failed: ${contentValidation.errors.join('; ')}`,
        warnings: contentValidation.warnings
      }
    }

    // Log warnings but continue with generation
    if (contentValidation.warnings.length > 0) {
      console.warn('Generated content validation warnings:', contentValidation.warnings)
    }

    // Create the generated talk object using validated content
    const validatedTalk = contentValidation.validatedTalk!
    const generatedTalk: GeneratedTalk = {
      title: validatedTalk.title,
      content: validatedTalk.content,
      duration: validatedTalk.duration,
      meetingType: questionnaire.meetingType,
      sources: extractedSources,
      questionnaire: questionnaire,
      createdAt: new Date()
    }

    console.log('Talk generation completed successfully', {
      title: generatedTalk.title,
      contentLength: generatedTalk.content.length,
      duration: generatedTalk.duration
    })

    return {
      success: true,
      talk: generatedTalk,
      warnings: [...(validation.warnings || []), ...(contentValidation.warnings || [])]
    }
  } catch (error) {
    console.error('Talk generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during talk generation'
    }
  }
}

/**
 * Generates a talk from processed questionnaire data (convenience function)
 */
export async function generateTalkFromQuestionnaire(
  sessionId: string
): Promise<{
  success: boolean
  talk?: GeneratedTalk
  error?: string
  warnings?: string[]
}> {
  try {
    // Retrieve stored questionnaire
    const storedData = await getStoredQuestionnaire(sessionId)

    if (!storedData.success || !storedData.data) {
      return {
        success: false,
        error: storedData.error || 'Failed to retrieve questionnaire data'
      }
    }

    // Generate talk using the questionnaire
    return await generateTalk(storedData.data.questionnaire)
  } catch (error) {
    console.error('Talk generation from questionnaire error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Processes AI response to extract title and clean content
 */
function processAIResponse(aiContent: string, fallbackTopic: string): {
  title: string
  content: string
} {
  const lines = aiContent.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  if (lines.length === 0) {
    return {
      title: `Talk on ${fallbackTopic}`,
      content: aiContent
    }
  }

  let title = fallbackTopic
  let contentStartIndex = 0

  // Look for title patterns in the first few lines
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i]

    // Check if line looks like a title
    if (
      line.length < 100 && // Not too long
      line.length > 5 && // Not too short
      (
        line.includes(':') || // "Title: Subtitle" format
        line.match(/^["'].*["']$/) || // Quoted title
        line.toLowerCase().includes('talk') ||
        line.match(/^[A-Z][^.!?]*$/) || // Starts with capital, no sentence ending
        (i === 0 && !line.includes('.')) // First line without period
      )
    ) {
      title = line
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/^\*\*|\*\*$/g, '') // Remove markdown bold formatting
        .replace(/^Talk:?\s*/i, '') // Remove "Talk:" prefix
        .replace(/^Title:?\s*/i, '') // Remove "Title:" prefix
        .trim()

      contentStartIndex = i + 1
      break
    }
  }

  // Extract content starting after the title
  const content = lines.slice(contentStartIndex).join('\n\n')

  return {
    title: title || `Talk on ${fallbackTopic}`,
    content: content || aiContent
  }
}

/**
 * Extracts Church sources from talk content
 */
function extractChurchSources(content: string): ChurchSource[] {
  const sources: ChurchSource[] = []
  const seenUrls = new Set<string>()

  // Patterns for different types of Church content
  const patterns = [
    // Direct churchofjesuschrist.org URLs
    /https?:\/\/(?:www\.)?churchofjesuschrist\.org\/[^\s)]+/gi,

    // Scripture references (Book Chapter:Verse format)
    /(?:1|2|3)\s*(?:Nephi|Corinthians|Timothy|Peter|John|Kings|Chronicles|Samuel)\s+\d+:\d+(?:-\d+)?/gi,
    /(?:Alma|Moroni|Ether|Mormon|Helaman|Mosiah|Jacob|Enos|Jarom|Omni|Words of Mormon)\s+\d+:\d+(?:-\d+)?/gi,
    /(?:Matthew|Mark|Luke|John|Acts|Romans|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Hebrews|James|Jude|Revelation)\s+\d+:\d+(?:-\d+)?/gi,
    /(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Ecclesiastes|Isaiah|Jeremiah|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi)\s+\d+:\d+(?:-\d+)?/gi,
    /(?:Psalms?|Proverbs)\s+\d+:\d+(?:-\d+)?/gi,
    /(?:D&C|Doctrine and Covenants)\s+\d+:\d+(?:-\d+)?/gi,
    /(?:Moses|Abraham|Joseph Smith—Matthew|Joseph Smith—History|Articles of Faith)\s+\d+:\d+(?:-\d+)?/gi
  ]

  // Extract URLs
  const urlMatches = content.match(patterns[0])
  if (urlMatches) {
    urlMatches.forEach(url => {
      const cleanUrl = url.replace(/[.,;!?)]$/, '') // Remove trailing punctuation
      if (!seenUrls.has(cleanUrl)) {
        seenUrls.add(cleanUrl)

        // Determine source type based on URL
        let type: ChurchSource['type'] = 'article'
        if (cleanUrl.includes('/study/scriptures/')) {
          type = 'scripture'
        } else if (cleanUrl.includes('/study/general-conference/')) {
          type = 'conference_talk'
        } else if (cleanUrl.includes('/study/manual/')) {
          type = 'manual'
        }

        sources.push({
          title: extractTitleFromUrl(cleanUrl),
          url: cleanUrl,
          type
        })
      }
    })
  }

  // Extract scripture references
  for (let i = 1; i < patterns.length; i++) {
    const scriptureMatches = content.match(patterns[i])
    if (scriptureMatches) {
      scriptureMatches.forEach(scripture => {
        const cleanScripture = scripture.trim()
        const scriptureUrl = `https://www.churchofjesuschrist.org/study/scriptures/${convertScriptureToUrl(cleanScripture)}`

        if (!seenUrls.has(scriptureUrl)) {
          seenUrls.add(scriptureUrl)
          sources.push({
            title: cleanScripture,
            url: scriptureUrl,
            type: 'scripture'
          })
        }
      })
    }
  }

  return sources
}

/**
 * Extracts title from Church URL
 */
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0)

    if (pathParts.includes('general-conference')) {
      // Extract conference talk title from URL
      const titlePart = pathParts[pathParts.length - 1]
      return titlePart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    } else if (pathParts.includes('scriptures')) {
      // Extract scripture reference
      return pathParts.slice(-2).join(' ').replace(/-/g, ' ')
    } else {
      // Generic title extraction
      const titlePart = pathParts[pathParts.length - 1]
      return titlePart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  } catch {
    return 'Church Source'
  }
}

/**
 * Converts scripture reference to URL format
 */
function convertScriptureToUrl(scripture: string): string {
  // This is a simplified conversion - in a real implementation,
  // you'd want a more comprehensive mapping
  const normalized = scripture.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/&/g, 'and')
    .replace(/[^\w\-:]/g, '')

  // Map common scripture abbreviations
  const bookMappings: { [key: string]: string } = {
    'd-c': 'dc',
    'doctrine-and-covenants': 'dc',
    '1-nephi': 'bofm/1-ne',
    '2-nephi': 'bofm/2-ne',
    'alma': 'bofm/alma',
    'moroni': 'bofm/moro',
    'matthew': 'nt/matt',
    'john': 'nt/john',
    'romans': 'nt/rom',
    'genesis': 'ot/gen',
    'psalms': 'ot/ps',
    'psalm': 'ot/ps'
  }

  for (const [key, value] of Object.entries(bookMappings)) {
    if (normalized.startsWith(key)) {
      return normalized.replace(key, value)
    }
  }

  return normalized
}

/**
 * Validates and sanitizes a generated talk with comprehensive safety checks
 */
export async function validateAndSanitizeGeneratedTalk(
  talk: GeneratedTalk
): Promise<{
  success: boolean
  validatedTalk?: GeneratedTalk
  errors: string[]
  warnings: string[]
}> {
  try {
    console.log('Validating generated talk:', talk.title)

    // Import validation functions
    const { validateCompleteGeneratedTalk, validateContentUrls, applySafetyFilter } = await import('./validation')

    // Perform comprehensive validation
    const validation = await validateCompleteGeneratedTalk({
      title: talk.title,
      content: talk.content,
      duration: talk.duration
    })

    if (!validation.success) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings
      }
    }

    // Validate URLs in content
    const urlValidation = await validateContentUrls(talk.content)
    if (!urlValidation.success) {
      return {
        success: false,
        errors: urlValidation.errors,
        warnings: validation.warnings
      }
    }

    // Apply safety filter
    const safetyResult = await applySafetyFilter(validation.validatedTalk!.content)
    if (!safetyResult.success) {
      return {
        success: false,
        errors: safetyResult.errors,
        warnings: validation.warnings
      }
    }

    // Create validated talk with filtered content
    const validatedTalk: GeneratedTalk = {
      ...talk,
      title: validation.validatedTalk!.title,
      content: safetyResult.filteredContent!,
      duration: validation.validatedTalk!.duration
    }

    // Add safety filter warnings
    const allWarnings = [...validation.warnings]
    if (safetyResult.removedContent.length > 0) {
      allWarnings.push(`Content filtered: ${safetyResult.removedContent.join(', ')}`)
    }

    console.log('Talk validation completed successfully', {
      title: validatedTalk.title,
      contentLength: validatedTalk.content.length,
      warningsCount: allWarnings.length
    })

    return {
      success: true,
      validatedTalk,
      errors: [],
      warnings: allWarnings
    }
  } catch (error) {
    console.error('Talk validation error:', error)
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown validation error'],
      warnings: []
    }
  }
}

/**
 * Checks if generated content meets Church content standards
 */
export async function validateChurchContentStandards(content: string): Promise<{
  success: boolean
  violations: string[]
  recommendations: string[]
}> {
  const violations: string[] = []
  const recommendations: string[] = []

  try {
    // Check for required elements in a Church talk
    const requiredElements = [
      {
        pattern: /\bJesus Christ\b/i,
        message: 'Talk should mention Jesus Christ'
      },
      {
        pattern: /\b(?:scripture|scriptures)\b/i,
        message: 'Consider including scripture references'
      },
      {
        pattern: /\b(?:testimony|testify|bear testimony)\b/i,
        message: 'Personal testimony should be included'
      }
    ]

    for (const element of requiredElements) {
      if (!element.pattern.test(content)) {
        recommendations.push(element.message)
      }
    }

    // Check for inappropriate content for Church setting
    const inappropriatePatterns = [
      {
        pattern: /\b(?:politics|political|democrat|republican)\b/gi,
        message: 'Avoid political content in Church talks'
      },
      {
        pattern: /\b(?:controversial|debate|argument)\b/gi,
        message: 'Avoid controversial topics'
      },
      {
        pattern: /\b(?:personal opinion|I think the church|church should)\b/gi,
        message: 'Avoid personal opinions about Church policies'
      }
    ]

    for (const pattern of inappropriatePatterns) {
      const matches = content.match(pattern.pattern)
      if (matches) {
        violations.push(`${pattern.message}: Found "${matches[0]}"`)
      }
    }

    // Check for proper Church terminology
    if (content.includes('Mormon Church') && !content.includes('The Church of Jesus Christ of Latter-day Saints')) {
      recommendations.push('Use "The Church of Jesus Christ of Latter-day Saints" instead of "Mormon Church"')
    }

    return {
      success: violations.length === 0,
      violations,
      recommendations
    }
  } catch (error) {
    console.error('Church content standards validation error:', error)
    return {
      success: false,
      violations: ['Failed to validate Church content standards'],
      recommendations: []
    }
  }
}

/**
 * Performs final safety and content validation before talk delivery
 */
export async function performFinalTalkValidation(talk: GeneratedTalk): Promise<{
  success: boolean
  readyForDelivery: boolean
  criticalIssues: string[]
  suggestions: string[]
}> {
  const criticalIssues: string[] = []
  const suggestions: string[] = []

  try {
    // Validate talk structure and content
    const validation = await validateAndSanitizeGeneratedTalk(talk)
    if (!validation.success) {
      criticalIssues.push(...validation.errors)
    }

    // Check Church content standards
    const standardsCheck = await validateChurchContentStandards(talk.content)
    if (!standardsCheck.success) {
      criticalIssues.push(...standardsCheck.violations)
    }
    suggestions.push(...standardsCheck.recommendations)

    // Check talk length vs duration
    const wordCount = talk.content.split(/\s+/).length
    const expectedWordCount = talk.duration * 110 // ~110 words per minute
    const wordCountDifference = Math.abs(wordCount - expectedWordCount) / expectedWordCount

    if (wordCountDifference > 0.3) { // More than 30% difference
      if (wordCount < expectedWordCount * 0.7) {
        criticalIssues.push(`Talk may be too short (${wordCount} words for ${talk.duration} minutes)`)
      } else if (wordCount > expectedWordCount * 1.3) {
        criticalIssues.push(`Talk may be too long (${wordCount} words for ${talk.duration} minutes)`)
      }
    }

    // Check for essential talk elements
    if (!talk.content.includes('In the name of Jesus Christ')) {
      suggestions.push('Consider ending with "In the name of Jesus Christ, amen"')
    }

    const readyForDelivery = criticalIssues.length === 0

    return {
      success: true,
      readyForDelivery,
      criticalIssues,
      suggestions
    }
  } catch (error) {
    console.error('Final talk validation error:', error)
    return {
      success: false,
      readyForDelivery: false,
      criticalIssues: [error instanceof Error ? error.message : 'Unknown validation error'],
      suggestions: []
    }
  }
}

/**
 * Exports a talk to Word document format (.docx)
 */
export async function exportTalkToWord(talk: GeneratedTalk): Promise<{
  success: boolean
  buffer?: Buffer
  filename?: string
  error?: string
}> {
  try {
    console.log('Exporting talk to Word:', talk.title)

    // Create document sections
    const children: Paragraph[] = []

    // Title
    children.push(
      new Paragraph({
        text: talk.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    )

    // Talk metadata
    const metadataText = [
      `Duration: ${talk.duration} minutes`,
      `Meeting Type: ${talk.meetingType === 'sacrament' ? 'Sacrament Meeting' : 'Stake Conference'}`,
      talk.createdAt ? `Generated: ${new Date(talk.createdAt).toLocaleDateString()}` : ''
    ].filter(Boolean).join(' • ')

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: metadataText,
            italics: true,
            size: 20
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 }
      })
    )

    // Talk content
    const contentParagraphs = talk.content
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)

    for (const paragraph of contentParagraphs) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: paragraph,
              size: 24
            })
          ],
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED
        })
      )
    }

    // Sources section
    if (talk.sources && talk.sources.length > 0) {
      // Add spacing before sources
      children.push(
        new Paragraph({
          text: '',
          spacing: { after: 400 }
        })
      )

      // Sources heading
      children.push(
        new Paragraph({
          text: 'Sources',
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 }
        })
      )

      // Add each source
      for (const source of talk.sources) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${source.title}`,
                bold: true,
                size: 22
              }),
              new TextRun({
                text: ` (${getSourceTypeLabel(source.type)})`,
                italics: true,
                size: 20
              })
            ],
            spacing: { after: 100 }
          })
        )

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: source.url,
                size: 20,
                underline: {
                  type: UnderlineType.SINGLE
                }
              })
            ],
            spacing: { after: 200 }
          })
        )
      }
    }

    // Create the document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children
        }
      ]
    })

    // Generate buffer
    const buffer = await Packer.toBuffer(doc)

    // Create filename
    const safeTitle = talk.title
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
    const filename = `${safeTitle}-talk.docx`

    console.log('Word document export completed', {
      title: talk.title,
      filename,
      bufferSize: buffer.length
    })

    return {
      success: true,
      buffer,
      filename
    }
  } catch (error) {
    console.error('Word export error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown export error'
    }
  }
}

/**
 * Helper function to get source type label for Word export
 */
function getSourceTypeLabel(type: ChurchSource['type']): string {
  switch (type) {
    case 'scripture':
      return 'Scripture'
    case 'conference_talk':
      return 'Conference Talk'
    case 'manual':
      return 'Manual'
    default:
      return 'Article'
  }
}

/**
 * Server action to handle talk export requests
 */
export async function handleTalkExport(talkData: GeneratedTalk): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Validate talk data
    if (!talkData.title || !talkData.content) {
      return {
        success: false,
        error: 'Invalid talk data for export'
      }
    }

    // Export to Word
    const exportResult = await exportTalkToWord(talkData)

    if (!exportResult.success) {
      return {
        success: false,
        error: exportResult.error || 'Export failed'
      }
    }

    // In a real implementation, you might:
    // 1. Store the file temporarily and return a download URL
    // 2. Send the file directly as a response
    // 3. Email the file to the user

    // For now, we'll return success and let the client handle the download
    return {
      success: true
    }
  } catch (error) {
    console.error('Talk export handler error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export handler error'
    }
  }
}

/**
 * Saves a generated talk to the database for authenticated users
 */
export async function saveTalkToDatabase(talk: GeneratedTalk): Promise<{
  success: boolean
  talkId?: string
  error?: string
}> {
  try {
    // Get current user session
    const session = await getSession()

    if (!session?.userId) {
      return {
        success: false,
        error: 'User must be authenticated to save talks'
      }
    }

    // Validate talk data
    if (!talk.title || !talk.content) {
      return {
        success: false,
        error: 'Invalid talk data - title and content are required'
      }
    }

    // Import Prisma client
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Create talk record
      const savedTalk = await prisma.talk.create({
        data: {
          title: talk.title,
          content: talk.content,
          duration: talk.duration,
          meetingType: talk.meetingType,
          topic: talk.questionnaire?.topic || null,
          personalStory: talk.questionnaire?.personalStory || null,
          gospelLibraryLinks: talk.questionnaire?.gospelLibraryLinks || [],
          preferences: talk.questionnaire ? {
            audienceType: talk.questionnaire.audienceType || null,
            preferredThemes: talk.questionnaire.preferredThemes || [],
            specificScriptures: talk.questionnaire.specificScriptures || []
          } : undefined,
          userId: session.userId
        }
      })

      console.log('Talk saved successfully', {
        talkId: savedTalk.id,
        title: savedTalk.title,
        userId: session.userId
      })

      return {
        success: true,
        talkId: savedTalk.id
      }
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Save talk error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save talk'
    }
  }
}

/**
 * Retrieves saved talks for the current authenticated user
 */
export async function getUserSavedTalks(): Promise<{
  success: boolean
  talks?: GeneratedTalk[]
  error?: string
}> {
  try {
    // Get current user session
    const session = await getSession()

    if (!session?.userId) {
      return {
        success: false,
        error: 'User must be authenticated to view saved talks'
      }
    }

    // Try to get talks from cache first
    const { getCachedUserTalks, setCachedUserTalks } = await import('../cache/queryCache')
    const cachedTalks = await getCachedUserTalks(session.userId)

    if (cachedTalks) {
      return {
        success: true,
        talks: cachedTalks as GeneratedTalk[]
      }
    }

    // Import Prisma client
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Fetch user's talks
      const savedTalks = await prisma.talk.findMany({
        where: {
          userId: session.userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Convert database records to GeneratedTalk format
      const talks: GeneratedTalk[] = savedTalks.map(talk => ({
        id: talk.id,
        title: talk.title,
        content: talk.content,
        duration: talk.duration,
        meetingType: talk.meetingType,
        sources: [], // Sources would need to be extracted from content or stored separately
        questionnaire: {
          topic: talk.topic || '',
          duration: talk.duration,
          meetingType: talk.meetingType as 'sacrament' | 'stake_conference',
          personalStory: talk.personalStory || undefined,
          gospelLibraryLinks: talk.gospelLibraryLinks,
          audienceType: (talk.preferences as TalkPreferences)?.audienceType,
          preferredThemes: (talk.preferences as TalkPreferences)?.preferredThemes || [],
          specificScriptures: (talk.preferences as TalkPreferences)?.specificScriptures || []
        },
        createdAt: talk.createdAt
      }))

      // Cache the talks for 10 minutes
      await setCachedUserTalks(session.userId, talks, 10 * 60)

      return {
        success: true,
        talks
      }
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Get saved talks error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve saved talks'
    }
  }
}

/**
 * Deletes a saved talk for the current authenticated user
 */
export async function deleteSavedTalk(talkId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Get current user session
    const session = await getSession()

    if (!session?.userId) {
      return {
        success: false,
        error: 'User must be authenticated to delete talks'
      }
    }

    // Validate talk ID
    if (!talkId) {
      return {
        success: false,
        error: 'Talk ID is required'
      }
    }

    // Import Prisma client
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Verify talk belongs to user and delete
      const deletedTalk = await prisma.talk.deleteMany({
        where: {
          id: talkId,
          userId: session.userId
        }
      })

      if (deletedTalk.count === 0) {
        return {
          success: false,
          error: 'Talk not found or you do not have permission to delete it'
        }
      }

      console.log('Talk deleted successfully', {
        talkId,
        userId: session.userId
      })

      return {
        success: true
      }
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Delete talk error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete talk'
    }
  }
}

/**
 * Updates a saved talk for the current authenticated user
 */
export async function updateSavedTalk(talkId: string, updates: Partial<GeneratedTalk>): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Get current user session
    const session = await getSession()

    if (!session?.userId) {
      return {
        success: false,
        error: 'User must be authenticated to update talks'
      }
    }

    // Validate talk ID
    if (!talkId) {
      return {
        success: false,
        error: 'Talk ID is required'
      }
    }

    // Import Prisma client
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Prepare update data
      const updateData: Record<string, unknown> = {}

      if (updates.title) updateData.title = updates.title
      if (updates.content) updateData.content = updates.content
      if (updates.duration) updateData.duration = updates.duration
      if (updates.meetingType) updateData.meetingType = updates.meetingType
      if (updates.questionnaire?.topic) updateData.topic = updates.questionnaire.topic
      if (updates.questionnaire?.personalStory !== undefined) {
        updateData.personalStory = updates.questionnaire.personalStory
      }
      if (updates.questionnaire?.gospelLibraryLinks) {
        updateData.gospelLibraryLinks = updates.questionnaire.gospelLibraryLinks
      }
      if (updates.questionnaire) {
        updateData.preferences = {
          audienceType: updates.questionnaire.audienceType,
          preferredThemes: updates.questionnaire.preferredThemes,
          specificScriptures: updates.questionnaire.specificScriptures
        }
      }

      // Update talk if it belongs to the user
      const updatedTalk = await prisma.talk.updateMany({
        where: {
          id: talkId,
          userId: session.userId
        },
        data: updateData
      })

      if (updatedTalk.count === 0) {
        return {
          success: false,
          error: 'Talk not found or you do not have permission to update it'
        }
      }

      console.log('Talk updated successfully', {
        talkId,
        userId: session.userId
      })

      return {
        success: true
      }
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Update talk error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update talk'
    }
  }
}

/**
 * Gets a specific saved talk by ID for the current authenticated user
 */
export async function getSavedTalkById(talkId: string): Promise<{
  success: boolean
  talk?: GeneratedTalk
  error?: string
}> {
  try {
    // Get current user session
    const session = await getSession()

    if (!session?.userId) {
      return {
        success: false,
        error: 'User must be authenticated to view saved talks'
      }
    }

    // Validate talk ID
    if (!talkId) {
      return {
        success: false,
        error: 'Talk ID is required'
      }
    }

    // Import Prisma client
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    try {
      // Fetch specific talk
      const savedTalk = await prisma.talk.findFirst({
        where: {
          id: talkId,
          userId: session.userId
        }
      })

      if (!savedTalk) {
        return {
          success: false,
          error: 'Talk not found or you do not have permission to view it'
        }
      }

      // Convert database record to GeneratedTalk format
      const talk: GeneratedTalk = {
        id: savedTalk.id,
        title: savedTalk.title,
        content: savedTalk.content,
        duration: savedTalk.duration,
        meetingType: savedTalk.meetingType,
        sources: [], // Sources would need to be extracted from content or stored separately
        questionnaire: {
          topic: savedTalk.topic || '',
          duration: savedTalk.duration,
          meetingType: savedTalk.meetingType as 'sacrament' | 'stake_conference',
          personalStory: savedTalk.personalStory || undefined,
          gospelLibraryLinks: savedTalk.gospelLibraryLinks,
          audienceType: (savedTalk.preferences as TalkPreferences)?.audienceType,
          preferredThemes: (savedTalk.preferences as TalkPreferences)?.preferredThemes || [],
          specificScriptures: (savedTalk.preferences as TalkPreferences)?.specificScriptures || []
        },
        createdAt: savedTalk.createdAt
      }

      return {
        success: true,
        talk
      }
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('Get saved talk error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve saved talk'
    }
  }
}