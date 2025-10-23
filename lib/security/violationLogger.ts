'use server'

import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'
import type { SecurityViolation } from './aiContentFilter'

const prisma = new PrismaClient()

export interface SecurityViolationLog {
    id: string
    type: string
    severity: string
    description: string
    detectedPattern: string
    userInput?: string
    ipAddress?: string
    userAgent?: string
    sessionId?: string
    violationCount: number
    lastViolationAt: Date
    createdAt: Date
    userId?: string
}

export interface RateLimitResult {
    isBlocked: boolean
    violationCount: number
    blockDuration: number // in minutes
    nextAllowedTime?: Date
}

/**
 * Rate limiting configuration based on violation severity
 */
const RATE_LIMIT_CONFIG = {
    low: {
        maxViolations: 10,
        timeWindow: 60, // minutes
        blockDuration: 15 // minutes
    },
    medium: {
        maxViolations: 5,
        timeWindow: 30,
        blockDuration: 60
    },
    high: {
        maxViolations: 3,
        timeWindow: 15,
        blockDuration: 240 // 4 hours
    },
    critical: {
        maxViolations: 1,
        timeWindow: 5,
        blockDuration: 1440 // 24 hours
    }
}

/**
 * Logs a security violation to the database
 */
export async function logSecurityViolation(
    violation: SecurityViolation,
    userInput?: string,
    userId?: string,
    sessionId?: string
): Promise<{
    success: boolean
    violationId?: string
    error?: string
}> {
    try {
        // Get request metadata
        const headersList = headers()
        const ipAddress = getClientIP(headersList)
        const userAgent = headersList.get('user-agent') || undefined

        // Check if this is a duplicate violation (same user, type, and pattern within 5 minutes)
        const recentViolation = await prisma.securityViolation.findFirst({
            where: {
                userId: userId || null,
                type: violation.type,
                detectedPattern: violation.detectedPattern,
                createdAt: {
                    gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
                }
            }
        })

        let violationRecord

        if (recentViolation) {
            // Update existing violation count
            violationRecord = await prisma.securityViolation.update({
                where: { id: recentViolation.id },
                data: {
                    violationCount: { increment: 1 },
                    lastViolationAt: new Date(),
                    userInput: userInput || recentViolation.userInput
                }
            })
        } else {
            // Create new violation record
            violationRecord = await prisma.securityViolation.create({
                data: {
                    type: violation.type,
                    severity: violation.severity,
                    description: violation.description,
                    detectedPattern: violation.detectedPattern,
                    userInput,
                    ipAddress,
                    userAgent,
                    sessionId,
                    userId: userId || null,
                    violationCount: 1,
                    lastViolationAt: new Date()
                }
            })
        }

        console.log('Security violation logged:', {
            id: violationRecord.id,
            type: violation.type,
            severity: violation.severity,
            userId: userId || 'anonymous',
            ipAddress
        })

        return {
            success: true,
            violationId: violationRecord.id
        }
    } catch (error) {
        console.error('Failed to log security violation:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Checks if a user should be rate limited based on their violation history
 */
export async function checkRateLimit(
    userId?: string,
    ipAddress?: string,
    sessionId?: string
): Promise<RateLimitResult> {
    try {
        // Build where clause for user identification
        const whereClause: any = {
            createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
        }

        // Prioritize user ID, then IP address, then session ID
        if (userId) {
            whereClause.userId = userId
        } else if (ipAddress) {
            whereClause.ipAddress = ipAddress
        } else if (sessionId) {
            whereClause.sessionId = sessionId
        } else {
            // No identification available, allow request
            return {
                isBlocked: false,
                violationCount: 0,
                blockDuration: 0
            }
        }

        // Get recent violations grouped by severity
        const violations = await prisma.securityViolation.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }
        })

        // Check each severity level
        for (const [severity, config] of Object.entries(RATE_LIMIT_CONFIG)) {
            const severityViolations = violations.filter(v => v.severity === severity)

            if (severityViolations.length === 0) continue

            // Check violations within the time window
            const timeWindowStart = new Date(Date.now() - config.timeWindow * 60 * 1000)
            const recentViolations = severityViolations.filter(v => v.createdAt >= timeWindowStart)

            // Calculate total violation count (including repeated violations)
            const totalViolationCount = recentViolations.reduce((sum, v) => sum + v.violationCount, 0)

            if (totalViolationCount >= config.maxViolations) {
                // Check if user is still in block period
                const latestViolation = severityViolations[0]
                const blockEndTime = new Date(latestViolation.lastViolationAt.getTime() + config.blockDuration * 60 * 1000)

                if (new Date() < blockEndTime) {
                    return {
                        isBlocked: true,
                        violationCount: totalViolationCount,
                        blockDuration: config.blockDuration,
                        nextAllowedTime: blockEndTime
                    }
                }
            }
        }

        // Calculate total violation count for response
        const totalCount = violations.reduce((sum, v) => sum + v.violationCount, 0)

        return {
            isBlocked: false,
            violationCount: totalCount,
            blockDuration: 0
        }
    } catch (error) {
        console.error('Rate limit check failed:', error)
        // On error, allow the request but log the issue
        return {
            isBlocked: false,
            violationCount: 0,
            blockDuration: 0
        }
    }
}

/**
 * Gets security violation statistics for monitoring
 */
export async function getViolationStatistics(
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'
): Promise<{
    success: boolean
    statistics?: {
        totalViolations: number
        violationsByType: Record<string, number>
        violationsBySeverity: Record<string, number>
        uniqueUsers: number
        uniqueIPs: number
        topPatterns: Array<{ pattern: string; count: number }>
    }
    error?: string
}> {
    try {
        // Calculate time range
        const timeRangeMs = {
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000
        }

        const startTime = new Date(Date.now() - timeRangeMs[timeRange])

        // Get violations within time range
        const violations = await prisma.securityViolation.findMany({
            where: {
                createdAt: { gte: startTime }
            },
            select: {
                type: true,
                severity: true,
                detectedPattern: true,
                violationCount: true,
                userId: true,
                ipAddress: true
            }
        })

        // Calculate statistics
        const totalViolations = violations.reduce((sum, v) => sum + v.violationCount, 0)

        const violationsByType: Record<string, number> = {}
        const violationsBySeverity: Record<string, number> = {}
        const patternCounts: Record<string, number> = {}
        const uniqueUsers = new Set<string>()
        const uniqueIPs = new Set<string>()

        for (const violation of violations) {
            // Count by type
            violationsByType[violation.type] = (violationsByType[violation.type] || 0) + violation.violationCount

            // Count by severity
            violationsBySeverity[violation.severity] = (violationsBySeverity[violation.severity] || 0) + violation.violationCount

            // Count patterns
            patternCounts[violation.detectedPattern] = (patternCounts[violation.detectedPattern] || 0) + violation.violationCount

            // Track unique users and IPs
            if (violation.userId) uniqueUsers.add(violation.userId)
            if (violation.ipAddress) uniqueIPs.add(violation.ipAddress)
        }

        // Get top patterns
        const topPatterns = Object.entries(patternCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([pattern, count]) => ({ pattern, count }))

        return {
            success: true,
            statistics: {
                totalViolations,
                violationsByType,
                violationsBySeverity,
                uniqueUsers: uniqueUsers.size,
                uniqueIPs: uniqueIPs.size,
                topPatterns
            }
        }
    } catch (error) {
        console.error('Failed to get violation statistics:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Gets violation history for a specific user
 */
export async function getUserViolationHistory(
    userId: string,
    limit: number = 50
): Promise<{
    success: boolean
    violations?: SecurityViolationLog[]
    error?: string
}> {
    try {
        const violations = await prisma.securityViolation.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                type: true,
                severity: true,
                description: true,
                detectedPattern: true,
                userInput: true,
                ipAddress: true,
                userAgent: true,
                sessionId: true,
                violationCount: true,
                lastViolationAt: true,
                createdAt: true,
                userId: true
            }
        })

        return {
            success: true,
            violations: violations as SecurityViolationLog[]
        }
    } catch (error) {
        console.error('Failed to get user violation history:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Cleans up old violation records (for maintenance)
 */
export async function cleanupOldViolations(
    olderThanDays: number = 90
): Promise<{
    success: boolean
    deletedCount?: number
    error?: string
}> {
    try {
        const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)

        const result = await prisma.securityViolation.deleteMany({
            where: {
                createdAt: { lt: cutoffDate },
                severity: { in: ['low', 'medium'] } // Keep high and critical violations longer
            }
        })

        console.log(`Cleaned up ${result.count} old security violations`)

        return {
            success: true,
            deletedCount: result.count
        }
    } catch (error) {
        console.error('Failed to cleanup old violations:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Extracts client IP address from headers
 */
function getClientIP(headersList: Headers): string | undefined {
    // Check various headers for client IP
    const ipHeaders = [
        'x-forwarded-for',
        'x-real-ip',
        'x-client-ip',
        'cf-connecting-ip', // Cloudflare
        'x-forwarded',
        'forwarded-for',
        'forwarded'
    ]

    for (const header of ipHeaders) {
        const value = headersList.get(header)
        if (value) {
            // x-forwarded-for can contain multiple IPs, take the first one
            const ip = value.split(',')[0].trim()
            if (ip && ip !== 'unknown') {
                return ip
            }
        }
    }

    return undefined
}

/**
 * Enhanced logging with user context
 */
export async function logSecurityViolationWithContext(
    violations: SecurityViolation[],
    context: {
        userInput?: string
        userId?: string
        sessionId?: string
        action?: string
        endpoint?: string
    }
): Promise<{
    success: boolean
    loggedViolations: string[]
    errors: string[]
}> {
    const loggedViolations: string[] = []
    const errors: string[] = []

    for (const violation of violations) {
        const result = await logSecurityViolation(
            violation,
            context.userInput,
            context.userId,
            context.sessionId
        )

        if (result.success && result.violationId) {
            loggedViolations.push(result.violationId)
        } else {
            errors.push(result.error || 'Unknown error')
        }
    }

    // Log additional context for monitoring
    if (violations.length > 0) {
        console.log('Security violations logged with context:', {
            violationCount: violations.length,
            userId: context.userId || 'anonymous',
            action: context.action,
            endpoint: context.endpoint,
            severities: violations.map(v => v.severity)
        })
    }

    return {
        success: errors.length === 0,
        loggedViolations,
        errors
    }
}