// Error logging and monitoring utilities

export interface ErrorLogEntry {
 timestamp: Date
 level: 'error' | 'warn' | 'info'
 message: string
 error?: Error
 context?: Record<string, unknown>
 userId?: string
 sessionId?: string
 userAgent?: string
 url?: string
}

export interface ErrorMonitoringService {
 logError: (entry: ErrorLogEntry) => Promise<void>
 logWarning: (entry: ErrorLogEntry) => Promise<void>
 logInfo: (entry: ErrorLogEntry) => Promise<void>
}

class ErrorLogger {
 private service: ErrorMonitoringService | null = null

 constructor() {
 // Initialize error monitoring service in production
 if (process.env.NODE_ENV === 'production') {
 // this.service = new ProductionErrorService()
 }
 }

 async logError(
 message: string,
 error?: Error,
 context?: Record<string, unknown>
 ): Promise<void> {
 const entry: ErrorLogEntry = {
 timestamp: new Date(),
 level: 'error',
 message,
 error,
 context,
 userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
 url: typeof window !== 'undefined' ? window.location.href : undefined
 }

 // Always log to console
 console.error(`[${entry.timestamp.toISOString()}] ERROR: ${message}`, {
 error,
 context
 })

 // Send to monitoring service if available
 if (this.service) {
 try {
 await this.service.logError(entry)
 } catch (serviceError) {
 console.error('Failed to send error to monitoring service:', serviceError)
 }
 }
 }

 async logWarning(
 message: string,
 context?: Record<string, unknown>
 ): Promise<void> {
 const entry: ErrorLogEntry = {
 timestamp: new Date(),
 level: 'warn',
 message,
 context,
 userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
 url: typeof window !== 'undefined' ? window.location.href : undefined
 }

 console.warn(`[${entry.timestamp.toISOString()}] WARNING: ${message}`, context)

 if (this.service) {
 try {
 await this.service.logWarning(entry)
 } catch (serviceError) {
 console.error('Failed to send warning to monitoring service:', serviceError)
 }
 }
 }

 async logInfo(
 message: string,
 context?: Record<string, unknown>
 ): Promise<void> {
 const entry: ErrorLogEntry = {
 timestamp: new Date(),
 level: 'info',
 message,
 context,
 userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
 url: typeof window !== 'undefined' ? window.location.href : undefined
 }

 console.info(`[${entry.timestamp.toISOString()}] INFO: ${message}`, context)

 if (this.service) {
 try {
 await this.service.logInfo(entry)
 } catch (serviceError) {
 console.error('Failed to send info to monitoring service:', serviceError)
 }
 }
 }

 // Specialized logging methods for common scenarios
 async logAuthError(message: string, error?: Error, userId?: string): Promise<void> {
 await this.logError(message, error, {
 category: 'authentication',
 userId
 })
 }

 async logValidationError(message: string, validationErrors: string[], context?: Record<string, unknown>): Promise<void> {
 await this.logError(message, undefined, {
 category: 'validation',
 validationErrors,
 ...context
 })
 }

 async logAPIError(message: string, error?: Error, endpoint?: string, statusCode?: number): Promise<void> {
 await this.logError(message, error, {
 category: 'api',
 endpoint,
 statusCode
 })
 }

 async logDatabaseError(message: string, error?: Error, operation?: string): Promise<void> {
 await this.logError(message, error, {
 category: 'database',
 operation
 })
 }

 async logTalkGenerationError(message: string, error?: Error, questionnaire?: Record<string, unknown>): Promise<void> {
 await this.logError(message, error, {
 category: 'talk_generation',
 questionnaire: questionnaire ? {
 topic: questionnaire.topic,
 duration: questionnaire.duration,
 meetingType: questionnaire.meetingType
 } : undefined
 })
 }

 // Client-side error capture
 setupGlobalErrorHandlers(): void {
 if (typeof window === 'undefined') return

 // Capture unhandled promise rejections
 window.addEventListener('unhandledrejection', (event) => {
 this.logError(
 'Unhandled promise rejection',
 event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
 {
 category: 'unhandled_rejection',
 reason: event.reason
 }
 )
 })

 // Capture global JavaScript errors
 window.addEventListener('error', (event) => {
 this.logError(
 'Global JavaScript error',
 event.error || new Error(event.message),
 {
 category: 'global_error',
 filename: event.filename,
 lineno: event.lineno,
 colno: event.colno
 }
 )
 })
 }
}

// Singleton instance
export const errorLogger = new ErrorLogger()

// Utility functions for common error scenarios
export const logError = (message: string, error?: Error, context?: Record<string, unknown>) =>
 errorLogger.logError(message, error, context)

export const logWarning = (message: string, context?: Record<string, unknown>) =>
 errorLogger.logWarning(message, context)

export const logInfo = (message: string, context?: Record<string, unknown>) =>
 errorLogger.logInfo(message, context)

// Specialized logging functions
export const logAuthError = (message: string, error?: Error, userId?: string) =>
 errorLogger.logAuthError(message, error, userId)

export const logValidationError = (message: string, validationErrors: string[], context?: Record<string, unknown>) =>
 errorLogger.logValidationError(message, validationErrors, context)

export const logAPIError = (message: string, error?: Error, endpoint?: string, statusCode?: number) =>
 errorLogger.logAPIError(message, error, endpoint, statusCode)

export const logDatabaseError = (message: string, error?: Error, operation?: string) =>
 errorLogger.logDatabaseError(message, error, operation)

export const logTalkGenerationError = (message: string, error?: Error, questionnaire?: Record<string, unknown>) =>
 errorLogger.logTalkGenerationError(message, error, questionnaire)

// Initialize global error handlers on client side
if (typeof window !== 'undefined') {
 errorLogger.setupGlobalErrorHandlers()
}