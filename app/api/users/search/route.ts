import { NextRequest, NextResponse } from 'next/server'
import { searchUsers } from '@/lib/actions/talks'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')

        console.log('User search request:', { query, queryLength: query?.length })

        if (!query || query.trim().length < 1) {
            return NextResponse.json({ users: [] })
        }

        // Use the server action to search users
        const result = await searchUsers(query.trim())

        console.log('Search result:', {
            success: result.success,
            userCount: result.users?.length || 0,
            error: result.error
        })

        if (!result.success) {
            console.error('Search users failed:', result.error)
            return NextResponse.json(
                { error: result.error || 'Search failed' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            users: result.users || [],
            count: result.users?.length || 0
        })
    } catch (error) {
        console.error('User search API error:', error)
        return NextResponse.json(
            { error: 'Failed to search users' },
            { status: 500 }
        )
    }
}