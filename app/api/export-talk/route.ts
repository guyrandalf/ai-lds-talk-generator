import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth'
import { getSavedTalkById, exportTalkToWord } from '@/lib/actions/talks'
import { checkAPIRateLimit } from '@/lib/security/rateLimit'
import { createRateLimitHeaders } from '@/lib/security/rateLimitUtils'
import { validateCSRFMiddleware } from '@/lib/security/csrf'
import { sanitizeInput } from '@/lib/security/inputSanitization'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkAPIRateLimit(request)
    if (!rateLimitResult.allowed) {
      const headers = createRateLimitHeaders(rateLimitResult)
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers }
      )
    }

    // CSRF validation
    const csrfValid = await validateCSRFMiddleware(request)
    if (!csrfValid) {
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      )
    }

    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get and sanitize talk ID from request body
    const body = await request.json()
    const talkIdResult = await sanitizeInput(body.talkId, 'general')

    if (!talkIdResult.success || !talkIdResult.sanitizedValue) {
      return NextResponse.json({ error: 'Invalid talk ID' }, { status: 400 })
    }

    const talkId = talkIdResult.sanitizedValue

    // Get the talk
    const talkResult = await getSavedTalkById(talkId)
    if (!talkResult.success || !talkResult.talk) {
      return NextResponse.json({ error: 'Talk not found' }, { status: 404 })
    }

    // Export to Word
    const exportResult = await exportTalkToWord(talkResult.talk)
    if (!exportResult.success || !exportResult.buffer || !exportResult.filename) {
      return NextResponse.json({ error: exportResult.error || 'Export failed' }, { status: 500 })
    }

    // Return the file as a download
    return new NextResponse(new Uint8Array(exportResult.buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
        'Content-Length': exportResult.buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Export API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}