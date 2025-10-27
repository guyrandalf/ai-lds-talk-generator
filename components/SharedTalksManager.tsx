"use client"

import * as React from "react"
import { Check, X, Eye, User, Calendar, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { getReceivedSharedTalks, respondToSharedTalk } from "@/lib/actions/talks"
import { ReceivedTalkDetails } from "@/lib/types/talks/sharing"
import { getMeetingTypeLabel } from "@/lib/utils/meetingTypes"


function SharedTalksManager() {
    const [sharedTalks, setSharedTalks] = React.useState<ReceivedTalkDetails[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [respondingTo, setRespondingTo] = React.useState<string | null>(null)

    // Load shared talks on component mount
    React.useEffect(() => {
        loadSharedTalks()
    }, [])

    const loadSharedTalks = async () => {
        try {
            setIsLoading(true)
            const result = await getReceivedSharedTalks()

            if (result.success && result.shares) {
                setSharedTalks(result.shares)
            } else {
                toast.error(result.error || 'Failed to load shared talks')
            }
        } catch (error) {
            console.error('Failed to load shared talks:', error)
            toast.error('Failed to load shared talks')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResponse = async (shareId: string, response: 'accepted' | 'declined') => {
        try {
            setRespondingTo(shareId)

            const result = await respondToSharedTalk(shareId, response)

            if (result.success) {
                toast.success(`Talk ${response} successfully`)
                // Reload the shared talks to reflect the change
                await loadSharedTalks()
            } else {
                toast.error(result.error || `Failed to ${response.slice(0, -1)} talk`)
            }
        } catch (error) {
            console.error(`Failed to ${response} talk:`, error)
            toast.error(`Failed to ${response.slice(0, -1)} talk`)
        } finally {
            setRespondingTo(null)
        }
    }

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'default'
            case 'declined':
                return 'destructive'
            case 'pending':
                return 'secondary'
            default:
                return 'outline'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'text-green-600'
            case 'declined':
                return 'text-red-600'
            case 'pending':
                return 'text-yellow-600'
            default:
                return 'text-gray-600'
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                    <span>Loading shared talks...</span>
                </div>
            </div>
        )
    }

    if (sharedTalks.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Shared Talks</CardTitle>
                    <CardDescription>
                        No talks have been shared with you yet.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Shared Talks</h2>
                <Button variant="outline" onClick={loadSharedTalks} disabled={isLoading}>
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4">
                {sharedTalks.map((share) => (
                    <Card key={share.id} className="relative">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">{share.talk.title}</CardTitle>
                                    <CardDescription>
                                        <div className="flex items-center space-x-4 text-sm">
                                            <div className="flex items-center space-x-1">
                                                <User className="h-3 w-3" />
                                                <span>
                                                    {share.sharedBy.firstName} {share.sharedBy.lastName}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(share.createdAt)}</span>
                                            </div>
                                        </div>
                                    </CardDescription>
                                </div>
                                <Badge variant={getStatusBadgeVariant(share.status)}>
                                    {share.status.charAt(0).toUpperCase() + share.status.slice(1)}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="space-y-4">
                                {/* Talk details */}
                                <div className="text-sm text-muted-foreground">
                                    <p>Duration: {share.talk.duration} minutes</p>
                                    <p>Meeting Type: {getMeetingTypeLabel(share.talk.meetingType)}</p>
                                </div>

                                {/* Message from sharer */}
                                {share.message && (
                                    <div className="bg-muted p-3 rounded-md">
                                        <div className="flex items-start space-x-2">
                                            <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Message from {share.sharedBy.firstName}:</p>
                                                <p className="text-sm text-muted-foreground mt-1">{share.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {/* Preview talk button */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Preview
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>{share.talk.title}</DialogTitle>
                                                    <DialogDescription>
                                                        Shared by {share.sharedBy.firstName} {share.sharedBy.lastName}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="mt-4">
                                                    <div className="prose max-w-none">
                                                        {share.talk.content.split('\n').map((paragraph, index) => (
                                                            <p key={index} className="mb-4">
                                                                {paragraph}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Response buttons for pending shares */}
                                    {share.status === 'pending' && (
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleResponse(share.id, 'declined')}
                                                disabled={respondingTo === share.id}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Decline
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleResponse(share.id, 'accepted')}
                                                disabled={respondingTo === share.id}
                                            >
                                                {respondingTo === share.id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Accept
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default SharedTalksManager