import { GeneratedTalk } from '@/lib/types/talks'

/**
 * Downloads a talk as a Word document
 */
export async function downloadTalkAsWord(talk: GeneratedTalk): Promise<{
 success: boolean
 error?: string
}> {
 try {
 const response = await fetch('/api/export-talk', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify(talk)
 })

 if (!response.ok) {
 const errorData = await response.json()
 throw new Error(errorData.error || 'Export failed')
 }

 // Get the blob from the response
 const blob = await response.blob()

 // Create download link
 const url = window.URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url

 // Get filename from Content-Disposition header or create one
 const contentDisposition = response.headers.get('Content-Disposition')
 let filename = 'talk.docx'

 if (contentDisposition) {
 const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
 if (filenameMatch) {
 filename = filenameMatch[1]
 }
 } else {
 // Create filename from talk title
 const safeTitle = talk.title
 .replace(/[^a-zA-Z0-9\s-]/g, '')
 .replace(/\s+/g, '-')
 .toLowerCase()
 filename = `${safeTitle}-talk.docx`
 }

 link.download = filename

 // Trigger download
 document.body.appendChild(link)
 link.click()

 // Cleanup
 document.body.removeChild(link)
 window.URL.revokeObjectURL(url)

 return { success: true }
 } catch (error) {
 console.error('Download error:', error)
 return {
 success: false,
 error: error instanceof Error ? error.message : 'Download failed'
 }
 }
}

/**
 * Utility function to trigger talk export with loading state management
 */
export async function exportTalkWithFeedback(
 talk: GeneratedTalk,
 onStart?: () => void,
 onSuccess?: () => void,
 onError?: (error: string) => void
): Promise<void> {
 try {
 onStart?.()

 const result = await downloadTalkAsWord(talk)

 if (result.success) {
 onSuccess?.()
 } else {
 onError?.(result.error || 'Export failed')
 }
 } catch (error) {
 onError?.(error instanceof Error ? error.message : 'Export failed')
 }
}