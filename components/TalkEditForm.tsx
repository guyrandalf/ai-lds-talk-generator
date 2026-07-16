'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { updateSavedTalk, generateTalk } from '@/lib/actions/talks'
import { GeneratedTalk, MeetingType, TalkQuestionnaire } from '@/lib/types/talks/generation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { FormLoadingOverlay } from '@/components/ui/LoadingOverlay'
import CustomThemeInput from '@/components/CustomThemeInput'
import AudienceContextSelector from '@/components/AudienceContextSelector'
import { CheckCircle, AlertCircle, Loader2, Plus, X, Sparkles } from 'lucide-react'
import { BaseComponentProps, LoadingProps } from '@/lib/types/components/common'
import { ErrorProps } from 'next/error'

const MEETING_TYPES: { value: MeetingType; label: string }[] = [
    { value: 'sacrament', label: 'Sacrament Meeting' },
    { value: 'stake_conference', label: 'Stake Conference' },
    { value: 'ward_conference', label: 'Ward Conference' },
    { value: 'area_devotional', label: 'Area Conference/Devotional' },
    { value: 'ysa_devotional', label: 'YSA Devotional/Fireside' },
    { value: 'youth_fireside', label: 'Youth Fireside' },
    { value: 'mission_conference', label: 'Mission Conference' },
    { value: 'senior_devotional', label: 'Senior Devotional' },
    { value: 'general_fireside', label: 'General Fireside' },
]

const AUDIENCE_TYPES = [
    { value: 'general', label: 'General Congregation' },
    { value: 'primary', label: 'Primary (3-11)' },
    { value: 'youth', label: 'Youth (12-18)' },
    { value: 'ysa', label: 'Young Single Adults (18-35)' },
    { value: 'single_adults', label: 'Single Adults (36+)' },
    { value: 'married_adults', label: 'Married Adults' },
    { value: 'senior_adults', label: 'Senior Adults (65+)' },
    { value: 'missionaries', label: 'Missionaries' },
    { value: 'new_members', label: 'New Members' },
    { value: 'less_active', label: 'Less Active Members' },
]

const SPEAKER_AGE_RANGES = [
    'Primary Child (3-11)',
    'Youth (12-18)',
    'Young Adult (18-35)',
    'Adult (36+)',
]

const COMMON_THEMES = [
    'Faith', 'Hope', 'Charity', 'Service', 'Gratitude', 'Forgiveness',
    'Repentance', 'Testimony', 'Family', 'Prayer', 'Scripture Study',
    'Discipleship', 'Atonement', 'Resurrection', 'Eternal Families',
    'Missionary Work', 'Temple Work', 'Obedience', 'Humility', 'Love',
]

const DURATION_MIN = 5
const DURATION_MAX = 60
const DURATION_DEFAULT = 15

interface TalkEditFormProps extends BaseComponentProps, LoadingProps, ErrorProps {
    talk: GeneratedTalk
}

export default function TalkEditForm({ talk }: TalkEditFormProps) {
    const q = talk.questionnaire

    // Generated output (editable directly)
    const [title, setTitle] = useState(talk.title)
    const [content, setContent] = useState(talk.content)

    // Questionnaire settings (same inputs as the create form)
    const [topic, setTopic] = useState(q?.topic || '')
    const [duration, setDuration] = useState(talk.duration)
    const [durationInput, setDurationInput] = useState(String(talk.duration))
    const [meetingType, setMeetingType] = useState<MeetingType>(talk.meetingType)
    const [audienceType, setAudienceType] = useState(q?.audienceType || 'general')
    const [speakerAge, setSpeakerAge] = useState(q?.speakerAge || '')
    const [audienceContext, setAudienceContext] = useState(q?.audienceContext || 'local')
    const [country, setCountry] = useState(q?.country || '')
    const [personalStory, setPersonalStory] = useState(q?.personalStory || '')
    const [testimony, setTestimony] = useState(q?.testimony || '')
    const [gospelLibraryLinks, setGospelLibraryLinks] = useState<string[]>(
        q?.gospelLibraryLinks?.length ? q.gospelLibraryLinks : ['']
    )
    const [specificScriptures, setSpecificScriptures] = useState<string[]>(
        q?.specificScriptures?.length ? q.specificScriptures : ['']
    )
    const [preferredThemes, setPreferredThemes] = useState<string[]>(q?.preferredThemes || [])
    const [customThemes, setCustomThemes] = useState<string[]>(q?.customThemes || [])

    const [isSaving, setIsSaving] = useState(false)
    const [isRegenerating, setIsRegenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleDurationChange = (raw: string) => {
        const digits = raw.replace(/[^0-9]/g, '')
        setDurationInput(digits)
        const parsed = parseInt(digits, 10)
        setDuration(Number.isNaN(parsed) ? 0 : parsed)
    }

    const handleDurationBlur = () => {
        const parsed = parseInt(durationInput, 10)
        const clamped = Number.isNaN(parsed)
            ? DURATION_DEFAULT
            : Math.min(DURATION_MAX, Math.max(DURATION_MIN, parsed))
        setDurationInput(String(clamped))
        setDuration(clamped)
    }

    const updateArrayItem = (
        list: string[],
        setList: (v: string[]) => void,
        index: number,
        value: string,
    ) => {
        const next = [...list]
        next[index] = value
        setList(next)
    }

    const addArrayItem = (list: string[], setList: (v: string[]) => void) => {
        setList([...list, ''])
    }

    const removeArrayItem = (
        list: string[],
        setList: (v: string[]) => void,
        index: number,
    ) => {
        const next = list.filter((_, i) => i !== index)
        setList(next.length ? next : [''])
    }

    // Build a questionnaire object from the current form state
    const buildQuestionnaire = (): TalkQuestionnaire => ({
        topic,
        duration,
        meetingType,
        personalStory,
        testimony,
        gospelLibraryLinks: gospelLibraryLinks.filter((l) => l.trim()),
        audienceType,
        speakerAge,
        preferredThemes,
        customThemes,
        audienceContext,
        specificScriptures: specificScriptures.filter((s) => s.trim()),
        country,
    })

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
                questionnaire: buildQuestionnaire(),
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

    const handleRegenerate = async () => {
        // Regenerating overwrites the current talk text, so confirm first
        const confirmed = window.confirm(
            'Regenerate the talk from the settings above? This replaces the current talk title and content. Your unsaved manual edits to the content will be lost.'
        )
        if (!confirmed) return

        setIsRegenerating(true)
        setError(null)
        setSuccess(false)

        try {
            const result = await generateTalk(buildQuestionnaire())

            if (result.success && result.data) {
                setTitle(result.data.title)
                setContent(result.data.content)
                toast.success('Talk regenerated. Review it, then click Save Changes to keep it.')
            } else {
                const message = result.error || 'Failed to regenerate the talk'
                setError(message)
                toast.error(message)
            }
        } catch {
            setError('An unexpected error occurred while regenerating')
        } finally {
            setIsRegenerating(false)
        }
    }

    const handleCancel = () => {
        router.push(`/talk/${talk.id}`)
    }

    const busy = isSaving || isRegenerating
    const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length

    return (
        <FormLoadingOverlay
            isLoading={busy}
            loadingText={isRegenerating ? 'Regenerating your talk...' : 'Saving changes...'}
        >
            <Card>
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

                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-t-lg">
                        <div className="flex">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <p className="ml-3 text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                <CardContent className="p-6 sm:p-8">
                    <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-8">
                        {/* Basic Information */}
                        <section className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

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
                                        placeholder="e.g., Faith, Service, Gratitude"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (minutes)</Label>
                                    <Input
                                        type="number"
                                        id="duration"
                                        inputMode="numeric"
                                        min={DURATION_MIN}
                                        max={DURATION_MAX}
                                        value={durationInput}
                                        onChange={(e) => handleDurationChange(e.target.value)}
                                        onBlur={handleDurationBlur}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Between {DURATION_MIN} and {DURATION_MAX} minutes
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meetingType">Meeting Type</Label>
                                    <Select value={meetingType} onValueChange={(v) => setMeetingType(v as MeetingType)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select meeting type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MEETING_TYPES.map((m) => (
                                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="audienceType">Audience Profile</Label>
                                    <Select value={audienceType} onValueChange={setAudienceType}>
                                        <SelectTrigger id="audienceType">
                                            <SelectValue placeholder="Select audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {AUDIENCE_TYPES.map((a) => (
                                                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Who the talk is addressed to (not the speaker&apos;s own age)
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="speakerAge">Speaker Age Range</Label>
                                    <Select value={speakerAge} onValueChange={setSpeakerAge}>
                                        <SelectTrigger id="speakerAge">
                                            <SelectValue placeholder="Select speaker age range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SPEAKER_AGE_RANGES.map((age) => (
                                                <SelectItem key={age} value={age}>{age}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="country">Country where talk is being given (optional)</Label>
                                <Input
                                    type="text"
                                    id="country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="e.g., Nigeria, United States, Brazil, Philippines..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Helps the AI use culturally relevant examples for your area.
                                </p>
                            </div>
                        </section>

                        {/* Personal Story & Testimony */}
                        <section className="space-y-6 border-t pt-8">
                            <h2 className="text-lg font-semibold text-gray-900">Personal Story &amp; Testimony</h2>

                            <div className="space-y-2">
                                <Label htmlFor="personalStory">Personal Story, Experience, or Study Insights</Label>
                                <Textarea
                                    id="personalStory"
                                    value={personalStory}
                                    onChange={(e) => setPersonalStory(e.target.value)}
                                    rows={5}
                                    className="resize-y"
                                    placeholder="Share a personal experience, insight from your study, or story related to your topic..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="testimony">Your Personal Testimony</Label>
                                <Textarea
                                    id="testimony"
                                    value={testimony}
                                    onChange={(e) => setTestimony(e.target.value)}
                                    rows={4}
                                    className="resize-y"
                                    placeholder="Write your testimony in your own words. The AI uses these exact words (grammar corrected) to close your talk..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Required if you regenerate. The AI won&apos;t invent one, it uses yours.
                                </p>
                            </div>
                        </section>

                        {/* Sources & Scriptures */}
                        <section className="space-y-6 border-t pt-8">
                            <h2 className="text-lg font-semibold text-gray-900">Sources &amp; Scriptures</h2>

                            <div className="space-y-2">
                                <Label>Gospel Library links (from churchofjesuschrist.org)</Label>
                                {gospelLibraryLinks.map((link, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            type="url"
                                            value={link}
                                            onChange={(e) => updateArrayItem(gospelLibraryLinks, setGospelLibraryLinks, index, e.target.value)}
                                            placeholder="https://www.churchofjesuschrist.org/study/..."
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeArrayItem(gospelLibraryLinks, setGospelLibraryLinks, index)}
                                            aria-label="Remove link"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() => addArrayItem(gospelLibraryLinks, setGospelLibraryLinks)}
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Gospel Library Link
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label>Additional scripture references (optional)</Label>
                                {specificScriptures.map((scripture, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            type="text"
                                            value={scripture}
                                            onChange={(e) => updateArrayItem(specificScriptures, setSpecificScriptures, index, e.target.value)}
                                            placeholder='e.g., "John 3:16", "2 Nephi 2:25"'
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => removeArrayItem(specificScriptures, setSpecificScriptures, index)}
                                            aria-label="Remove scripture"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() => addArrayItem(specificScriptures, setSpecificScriptures)}
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Scripture Reference
                                </Button>
                            </div>
                        </section>

                        {/* Themes */}
                        <section className="space-y-4 border-t pt-8">
                            <h2 className="text-lg font-semibold text-gray-900">Talk Themes</h2>
                            <CustomThemeInput
                                predefinedThemes={COMMON_THEMES}
                                selectedThemes={preferredThemes}
                                customThemes={customThemes}
                                onThemeChange={setPreferredThemes}
                                onCustomThemeAdd={(theme) => setCustomThemes([...customThemes, theme])}
                                onCustomThemeRemove={(theme) => setCustomThemes(customThemes.filter((t) => t !== theme))}
                                disabled={busy}
                            />
                        </section>

                        {/* Audience Context */}
                        <section className="space-y-4 border-t pt-8">
                            <h2 className="text-lg font-semibold text-gray-900">Audience Context</h2>
                            <AudienceContextSelector
                                selectedContext={audienceContext}
                                onContextChange={setAudienceContext}
                                disabled={busy}
                            />
                        </section>

                        {/* Talk Content */}
                        <section className="space-y-2 border-t pt-8">
                            <Label htmlFor="content" className="text-lg font-semibold text-gray-900">Talk Content</Label>
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
                                Current word count: {wordCount} words
                            </p>
                        </section>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t">
                            <div className="flex flex-wrap gap-3">
                                <Button type="button" variant="outline" onClick={handleCancel} disabled={busy}>
                                    Cancel
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/dashboard">Back to Dashboard</Link>
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleRegenerate}
                                    disabled={busy}
                                >
                                    {isRegenerating ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Regenerating...</>
                                    ) : (
                                        <><Sparkles className="mr-2 h-4 w-4" /> Regenerate Talk</>
                                    )}
                                </Button>
                                <Button type="submit" disabled={busy || !title.trim() || !content.trim()}>
                                    {isSaving ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </FormLoadingOverlay>
    )
}
