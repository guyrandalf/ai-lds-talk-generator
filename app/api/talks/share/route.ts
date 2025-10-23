import { NextRequest, NextResponse } from 'next/server'
import { shareTalk } from '@/lib/actions/talks'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { talkId, recipientIds, message } = body

        // Validate input
        if (!talkId || !recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
            return NextResponse.json(
                { error: 'Talk ID and recipient IDs are required' },
                { status: 400 }
            )
        }

        // Use the server action to share the talk
        const result = await shareTalk(talkId, recipientIds, message)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            sharesCreated: result.sharesCreated
        })

    } catch (error) {
        console.error('Talk sharing error:', error)
        return NextResponse.json(
            { error: 'Failed to share talk' },
            { status: 500 }
        )
    }
}