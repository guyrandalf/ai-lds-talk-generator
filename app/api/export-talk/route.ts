import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/actions/auth'
import { getSavedTalkById, exportTalkToWord } from '@/lib/actions/talks'
import { sanitizeInput } from '@/lib/security/inputSanitization'

export async function POST(request: NextRequest) {
  try {

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
    if (!talkResult.success || !talkResult.data) {
      return NextResponse.json({ error: 'Talk not found' }, { status: 404 })
    }

    // Export to Word
    const exportResult = await exportTalkToWord(talkResult.data)
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