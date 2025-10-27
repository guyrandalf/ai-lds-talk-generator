"use client"

import * as React from "react"
import { User, MessageSquare, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { getSharedTalksByUser } from "@/lib/actions/talks"
import { SharedTalkDetails } from "@/lib/types/talks/sharing"
import { getMeetingTypeLabel } from "@/lib/utils/meetingTypes"



function MySharedTalks() {
    const [sharedTalks, setSharedTalks] = React.useState<SharedTalkDetails[]>([])
    const [isLoading, setIsLoading] = React.useState(true)

    // Load shared talks on component mount
    React.useEffect(() => {
        loadSharedTalks()
    }, [])

    const loadSharedTalks = async () => {
        try {
            setIsLoading(true)
            const result = await getSharedTalksByUser()

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

    const groupedShares = React.useMemo(() => {
        const groups: { [talkId: string]: SharedTalkDetails[] } = {}

        sharedTalks.forEach(share => {
            const talkId = share.talk.id || share.id // fallback to share.id if talk.id is undefined
            if (!groups[talkId]) {
                groups[talkId] = []
            }
            groups[talkId].push(share)
        })

        return groups
    }, [sharedTalks])

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                    <span>Loading your shared talks...</span>
                </div>
            </div>
        )
    }

    if (Object.keys(groupedShares).length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Shared Talks</CardTitle>
                    <CardDescription>
                        You haven&apos;t shared any talks yet.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Shared Talks</h2>
                <Button variant="outline" onClick={loadSharedTalks} disabled={isLoading}>
                    Refresh
                </Button>
            </div>

            <div className="grid gap-6">
                {Object.entries(groupedShares).map(([talkId, shares]) => {
                    const talk = shares[0].talk
                    const pendingCount = shares.filter(s => s.status === 'pending').length
                    const acceptedCount = shares.filter(s => s.status === 'accepted').length
                    const declinedCount = shares.filter(s => s.status === 'declined').length

                    return (
                        <Card key={talkId}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{talk.title}</CardTitle>
                                        <CardDescription>
                                            Shared with {shares.length} user{shares.length > 1 ? 's' : ''}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {pendingCount > 0 && (
                                            <Badge variant="secondary">{pendingCount} pending</Badge>
                                        )}
                                        {acceptedCount > 0 && (
                                            <Badge variant="default">{acceptedCount} accepted</Badge>
                                        )}
                                        {declinedCount > 0 && (
                                            <Badge variant="destructive">{declinedCount} declined</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="space-y-4">
                                    {/* Talk details */}
                                    <div className="text-sm text-muted-foreground">
                                        <p>Duration: {talk.duration} minutes</p>
                                        <p>Meeting Type: {getMeetingTypeLabel(talk.meetingType)}</p>
                                    </div>

                                    {/* Preview button */}
                                    <div className="flex items-center justify-between">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Preview Talk
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>{talk.title}</DialogTitle>
                                                    <DialogDescription>
                                                        Your shared talk
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="mt-4">
                                                    <div className="prose max-w-none">
                                                        {talk.content.split('\n').map((paragraph, index) => (
                                                            <p key={index} className="mb-4">
                                                                {paragraph}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* List of recipients */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Shared with:</h4>
                                        <div className="space-y-2">
                                            {shares.map((share) => (
                                                <div
                                                    key={share.id}
                                                    className="flex items-center justify-between p-3 bg-muted rounded-md"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {share.sharedWith.firstName} {share.sharedWith.lastName}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {share.sharedWith.email}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-3">
                                                        <div className="text-right">
                                                            <Badge variant={getStatusBadgeVariant(share.status)}>
                                                                {share.status.charAt(0).toUpperCase() + share.status.slice(1)}
                                                            </Badge>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Shared {formatDate(share.createdAt)}
                                                            </p>
                                                            {share.respondedAt && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    Responded {formatDate(share.respondedAt)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Show messages if any */}
                                    {shares.some(s => s.message) && (
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium">Messages:</h4>
                                            {shares
                                                .filter(s => s.message)
                                                .map((share) => (
                                                    <div key={share.id} className="bg-muted p-3 rounded-md">
                                                        <div className="flex items-start space-x-2">
                                                            <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    To {share.sharedWith.firstName}:
                                                                </p>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {share.message}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

export default MySharedTalks