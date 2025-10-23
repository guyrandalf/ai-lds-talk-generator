import { NextRequest, NextResponse } from 'next/server'
import { searchUsers } from '@/lib/actions/talks'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')

        if (!query || query.length < 2) {
            return NextResponse.json({ users: [] })
        }

        // Use the server action to search users
        const result = await searchUsers(query)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({ users: result.users })
    } catch (error) {
        console.error('User search error:', error)
        return NextResponse.json(
            { error: 'Failed to search users' },
            { status: 500 }
        )
    }
}