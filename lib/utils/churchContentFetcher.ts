'use server'

// In-memory cache for fetched church content (24 hours)
const contentCache = new Map<string, { text: string; fetchedAt: number }>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Strips HTML tags and extracts readable text from HTML content
 */
function stripHtml(html: string): string {
    return html
        // Remove script and style blocks entirely
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<aside[\s\S]*?<\/aside>/gi, '')
        // Convert block elements to newlines
        .replace(/<\/?(p|div|section|article|h[1-6]|li|br)[^>]*>/gi, '\n')
        // Remove all remaining HTML tags
        .replace(/<[^>]+>/g, '')
        // Decode common HTML entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&lsquo;/g, "'")
        .replace(/&rsquo;/g, "'")
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        // Collapse whitespace
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

/**
 * Extracts the main article/talk content from churchofjesuschrist.org HTML.
 * Tries to find the primary content area first, falls back to full stripped text.
 */
function extractMainContent(html: string): string {
    // Try to find the main article body
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    if (articleMatch) {
        return stripHtml(articleMatch[1])
    }

    // Try to find content by common Church website class patterns
    const mainContentMatch = html.match(/class="[^"]*(?:body-block|article-content|study-content|content-body)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|section|article)>/i)
    if (mainContentMatch) {
        return stripHtml(mainContentMatch[1])
    }

    // Fall back to stripping the full page but limit size
    return stripHtml(html)
}

/**
 * Fetches and extracts text content from a churchofjesuschrist.org URL.
 * Returns null if the fetch fails or the URL is not accessible.
 * Content is truncated to `maxChars` to keep AI prompts manageable.
 */
export async function fetchChurchPageContent(
    url: string,
    maxChars = 4000
): Promise<string | null> {
    // Check cache first
    const cached = contentCache.get(url)
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.text.slice(0, maxChars)
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; PulpitPal/1.0)',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            signal: AbortSignal.timeout(8000), // 8 second timeout
        })

        if (!response.ok) {
            console.warn(`Failed to fetch church content from ${url}: ${response.status}`)
            return null
        }

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('text/html')) {
            // Not an HTML page (might be PDF or other)
            return null
        }

        const html = await response.text()
        const text = extractMainContent(html)

        if (!text || text.length < 50) {
            return null
        }

        // Cache the result
        contentCache.set(url, { text, fetchedAt: Date.now() })

        return text.slice(0, maxChars)
    } catch (error) {
        console.warn(`Error fetching church content from ${url}:`, error instanceof Error ? error.message : error)
        return null
    }
}

/**
 * Fetches content from multiple church URLs and returns a formatted string
 * suitable for inclusion in an AI prompt.
 */
export async function fetchMultipleChurchContents(
    urls: string[],
    maxCharsPerUrl = 3000
): Promise<string> {
    const validUrls = urls.filter(u => u.trim() && u.startsWith('https://www.churchofjesuschrist.org/'))

    if (validUrls.length === 0) {
        return ''
    }

    const results = await Promise.all(
        validUrls.map(async (url) => {
            const content = await fetchChurchPageContent(url, maxCharsPerUrl)
            if (!content) {
                return `[URL: ${url} — content could not be fetched, reference by URL only]`
            }
            return `[CONTENT FROM: ${url}]\n${content}\n[END CONTENT]`
        })
    )

    return results.join('\n\n')
}
