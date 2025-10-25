// Simple in-memory cache implementation
interface CacheItem<T> {
 value: T
 expires: number
}

class SimpleCache<T = unknown> {
 private cache = new Map<string, CacheItem<T>>()
 private ttl: number

 constructor(ttlSeconds: number = 300) {
 this.ttl = ttlSeconds * 1000 // Convert to milliseconds

 // Clean up expired items every minute
 setInterval(() => {
 this.cleanup()
 }, 60000)
 }

 get<U = T>(key: string): U | undefined {
 const item = this.cache.get(key)
 if (!item) return undefined

 if (Date.now() > item.expires) {
 this.cache.delete(key)
 return undefined
 }

 return item.value as unknown as U
 }

 set<U = T>(key: string, value: U, customTtl?: number): boolean {
 const ttl = customTtl ? customTtl * 1000 : this.ttl
 this.cache.set(key, {
 value: value as unknown as T,
 expires: Date.now() + ttl
 })
 return true
 }

 del(key: string): number {
 return this.cache.delete(key) ? 1 : 0
 }

 has(key: string): boolean {
 const item = this.cache.get(key)
 if (!item) return false

 if (Date.now() > item.expires) {
 this.cache.delete(key)
 return false
 }

 return true
 }

 flushAll(): void {
 this.cache.clear()
 }

 getStats() {
 return {
 keys: this.cache.size,
 hits: 0, // Simple implementation doesn't track hits
 misses: 0
 }
 }

 private cleanup(): void {
 const now = Date.now()
 for (const [key, item] of this.cache.entries()) {
 if (now > item.expires) {
 this.cache.delete(key)
 }
 }
 }
}

// Cache configurations for different data types
const CACHE_CONFIGS = {
 users: 5 * 60, // 5 minutes
 talks: 10 * 60, // 10 minutes
 generated: 30 * 60, // 30 minutes
 validation: 60 * 60, // 1 hour
 churchContent: 24 * 60 * 60 // 24 hours
}

// Create cache instances
const caches = {
 users: new SimpleCache<unknown>(CACHE_CONFIGS.users),
 talks: new SimpleCache<unknown>(CACHE_CONFIGS.talks),
 generated: new SimpleCache<unknown>(CACHE_CONFIGS.generated),
 validation: new SimpleCache<unknown>(CACHE_CONFIGS.validation),
 churchContent: new SimpleCache<unknown>(CACHE_CONFIGS.churchContent)
}

// Cache key generators
const createCacheKey = {
 user: (userId: string) => `user:${userId}`,
 userTalks: (userId: string) => `user_talks:${userId}`,
 talk: (talkId: string) => `talk:${talkId}`,
 talkGeneration: (questionnaireHash: string) => `generation:${questionnaireHash}`,
 urlValidation: (url: string) => `url_validation:${Buffer.from(url).toString('base64')}`,
 contentValidation: (contentHash: string) => `content_validation:${contentHash}`,
 churchContent: (url: string) => `church_content:${Buffer.from(url).toString('base64')}`
}

/**
 * Generic cache operations
 */
export class QueryCache {
 private cache: SimpleCache<unknown>

 constructor(cacheType: keyof typeof caches) {
 this.cache = caches[cacheType]
 }

 async get<T>(key: string): Promise<T | null> {
 try {
 const value = this.cache.get<T>(key)
 return value || null
 } catch (error) {
 console.error('Cache get error:', error)
 return null
 }
 }

 async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
 try {
 return this.cache.set(key, value, ttl || 0)
 } catch (error) {
 console.error('Cache set error:', error)
 return false
 }
 }

 async del(key: string): Promise<number> {
 try {
 return this.cache.del(key)
 } catch (error) {
 console.error('Cache delete error:', error)
 return 0
 }
 }

 async has(key: string): Promise<boolean> {
 try {
 return this.cache.has(key)
 } catch (error) {
 console.error('Cache has error:', error)
 return false
 }
 }

 async flush(): Promise<void> {
 try {
 this.cache.flushAll()
 } catch (error) {
 console.error('Cache flush error:', error)
 }
 }

 getStats() {
 return this.cache.getStats()
 }
}

/**
 * User data caching
 */
export const userCache = new QueryCache('users')

export async function getCachedUser(userId: string) {
 return await userCache.get(createCacheKey.user(userId))
}

export async function setCachedUser(userId: string, userData: unknown, ttl?: number) {
 return await userCache.set(createCacheKey.user(userId), userData, ttl)
}

export async function invalidateUserCache(userId: string) {
 await userCache.del(createCacheKey.user(userId))
 await userCache.del(createCacheKey.userTalks(userId))
}

/**
 * Talk data caching
 */
export const talkCache = new QueryCache('talks')

export async function getCachedTalk(talkId: string) {
 return await talkCache.get(createCacheKey.talk(talkId))
}

export async function setCachedTalk(talkId: string, talkData: unknown, ttl?: number) {
 return await talkCache.set(createCacheKey.talk(talkId), talkData, ttl)
}

export async function getCachedUserTalks(userId: string) {
 return await talkCache.get(createCacheKey.userTalks(userId))
}

export async function setCachedUserTalks(userId: string, talksData: unknown, ttl?: number) {
 return await talkCache.set(createCacheKey.userTalks(userId), talksData, ttl)
}

export async function invalidateTalkCache(talkId: string, userId?: string) {
 await talkCache.del(createCacheKey.talk(talkId))
 if (userId) {
 await talkCache.del(createCacheKey.userTalks(userId))
 }
}

/**
 * Generated content caching
 */
export const generatedCache = new QueryCache('generated')

export async function getCachedGeneration(questionnaireHash: string) {
 return await generatedCache.get(createCacheKey.talkGeneration(questionnaireHash))
}

export async function setCachedGeneration(questionnaireHash: string, generatedTalk: unknown, ttl?: number) {
 return await generatedCache.set(createCacheKey.talkGeneration(questionnaireHash), generatedTalk, ttl)
}

/**
 * Validation results caching
 */
export const validationCache = new QueryCache('validation')

export async function getCachedUrlValidation(url: string) {
 return await validationCache.get(createCacheKey.urlValidation(url))
}

export async function setCachedUrlValidation(url: string, validationResult: unknown, ttl?: number) {
 return await validationCache.set(createCacheKey.urlValidation(url), validationResult, ttl)
}

export async function getCachedContentValidation(contentHash: string) {
 return await validationCache.get(createCacheKey.contentValidation(contentHash))
}

export async function setCachedContentValidation(contentHash: string, validationResult: unknown, ttl?: number) {
 return await validationCache.set(createCacheKey.contentValidation(contentHash), validationResult, ttl)
}

/**
 * Church content caching
 */
export const churchContentCache = new QueryCache('churchContent')

export async function getCachedChurchContent(url: string) {
 return await churchContentCache.get(createCacheKey.churchContent(url))
}

export async function setCachedChurchContent(url: string, content: unknown, ttl?: number) {
 return await churchContentCache.set(createCacheKey.churchContent(url), content, ttl)
}

/**
 * Utility functions
 */
export function createContentHash(content: string): string {
 // Simple hash function for content
 let hash = 0
 for (let i = 0; i < content.length; i++) {
 const char = content.charCodeAt(i)
 hash = ((hash << 5) - hash) + char
 hash = hash & hash // Convert to 32-bit integer
 }
 return Math.abs(hash).toString(36)
}

export function createQuestionnaireHash(questionnaire: Record<string, unknown>): string {
 // Create a hash from questionnaire data for caching
 const key = JSON.stringify({
 topic: questionnaire.topic,
 duration: questionnaire.duration,
 meetingType: questionnaire.meetingType,
 personalStory: typeof questionnaire.personalStory === 'string' ? questionnaire.personalStory.substring(0, 100) : undefined, // First 100 chars only
 gospelLibraryLinks: Array.isArray(questionnaire.gospelLibraryLinks) ? questionnaire.gospelLibraryLinks.sort() : [],
 preferredThemes: Array.isArray(questionnaire.preferredThemes) ? questionnaire.preferredThemes.sort() : [],
 specificScriptures: Array.isArray(questionnaire.specificScriptures) ? questionnaire.specificScriptures.sort() : []
 })

 return createContentHash(key)
}

/**
 * Cache warming functions
 */
export async function warmUserCache(userId: string) {
 try {
 // This would typically fetch and cache user data
 console.log(`Warming cache for user: ${userId}`)
 // Implementation would depend on your data fetching logic
 } catch (error) {
 console.error('Cache warming error:', error)
 }
}

/**
 * Cache statistics and monitoring
 */
export function getAllCacheStats() {
 return {
 users: caches.users.getStats(),
 talks: caches.talks.getStats(),
 generated: caches.generated.getStats(),
 validation: caches.validation.getStats(),
 churchContent: caches.churchContent.getStats()
 }
}

/**
 * Cache cleanup and maintenance
 */
export async function performCacheMaintenance() {
 try {
 const stats = getAllCacheStats()
 console.log('Cache maintenance - Current stats:', stats)

 // Log cache hit rates
 Object.entries(stats).forEach(([cacheName, stat]) => {
 const hitRate = stat.hits / (stat.hits + stat.misses) * 100
 console.log(`${cacheName} cache hit rate: ${hitRate.toFixed(2)}%`)
 })

 // Could implement additional maintenance logic here
 // such as preemptive cache warming, cleanup of stale entries, etc.
 } catch (error) {
 console.error('Cache maintenance error:', error)
 }
}