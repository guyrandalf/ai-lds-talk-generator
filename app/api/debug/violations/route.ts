import { NextRequest, NextResponse } from 'next/server'
import { getRecentViolations, getViolationById } from '@/lib/security/violationLogger'
import { getSession } from '@/lib/actions/auth'

export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated (you might want to add admin check here)
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const violationId = searchParams.get('id')
        const limit = parseInt(searchParams.get('limit') || '10')

        if (violationId) {
            // Get specific violation
            const violation = await getViolationById(violationId)
            if (!violation) {
                return NextResponse.json({ error: 'Violation not found' }, { status: 404 })
            }
            return NextResponse.json({ violation })
        } else {
            // Get recent violations
            const violations = await getRecentViolations(limit)
            return NextResponse.json({ violations })
        }
    } catch (error) {
        console.error('Debug violations API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}