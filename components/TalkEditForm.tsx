'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateSavedTalk } from '@/lib/actions/talks'
import { GeneratedTalk, MeetingType } from '@/lib/types/talks/generation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { FormLoadingOverlay } from '@/components/ui/LoadingOverlay'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { BaseComponentProps, LoadingProps } from '@/lib/types/components/common'
import { ErrorProps } from 'next/error'


interface TalkEditFormProps extends BaseComponentProps, LoadingProps, ErrorProps {
    talk: GeneratedTalk
}

export default function TalkEditForm({ talk }: TalkEditFormProps) {
    const [title, setTitle] = useState(talk.title)
    const [content, setContent] = useState(talk.content)
    const [duration, setDuration] = useState(talk.duration)
    const [meetingType, setMeetingType] = useState(talk.meetingType)
    const [topic, setTopic] = useState(talk.questionnaire?.topic || '')
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        if (!talk.id) return

        setIsSaving(true)
        setError(null)
        setSuccess(false)

        try {
            const updates: Partial<GeneratedTalk> = {
                title,
                content,
                duration,
                meetingType,
                questionnaire: {
                    ...talk.questionnaire,
                    topic,
                    duration,
                    meetingType: meetingType
                }
            }

            const result = await updateSavedTalk(talk.id, updates)

            if (result.success) {
                setSuccess(true)
                setTimeout(() => {
                    router.push(`/talk/${talk.id}`)
                }, 1500)
            } else {
                setError(result.error || 'Failed to save changes')
            }
        } catch {
            setError('An unexpected error occurred while saving')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        router.push(`/talk/${talk.id}`)
    }

    return (
        <FormLoadingOverlay isLoading={isSaving} loadingText="Saving changes...">
            <Card>
                {/* Success Message */}
                {success && (
                    <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-t-lg">
                        <div className="flex">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <p className="ml-3 text-sm text-green-700">
                                Talk saved successfully! Redirecting to view...
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-t-lg">
                        <div className="flex">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <p className="ml-3 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <CardContent className="p-8">
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Talk Title</Label>
                                <Input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter talk title"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic</Label>
                                <Input
                                    type="text"
                                    id="topic"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Talk topic"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input
                                    type="number"
                                    id="duration"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                                    min="5"
                                    max="60"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meetingType">Meeting Type</Label>
                                <Select value={meetingType} onValueChange={(value) => setMeetingType(value as MeetingType)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select meeting type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sacrament">Sacrament Meeting</SelectItem>
                                        <SelectItem value="stake_conference">Stake Conference</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Talk Content */}
                        <div className="space-y-2">
                            <Label htmlFor="content">Talk Content</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={20}
                                className="resize-y"
                                placeholder="Enter your talk content here..."
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                Current word count: {content.split(/\s+/).filter(word => word.length > 0).length} words
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t">
                            <div className="flex space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/dashboard">
                                        Back to Dashboard
                                    </Link>
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSaving || !title.trim() || !content.trim()}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </FormLoadingOverlay>
    )
}