"use client"

import * as React from "react"
import { Share2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UserSearchCombobox } from "./UserSearchCombobox"
import { toast } from "sonner"

interface User {
    id: string
    email: string
    firstName: string
    lastName: string
}

interface Talk {
    id: string
    title: string
    content: string
}

interface ShareTalkDialogProps {
    talk: Talk
    onShareComplete?: () => void
    variant?: 'button' | 'inline'
}

export function ShareTalkDialog({ talk, onShareComplete, variant = 'button' }: ShareTalkDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [selectedUsers, setSelectedUsers] = React.useState<User[]>([])
    const [message, setMessage] = React.useState("")
    const [isSharing, setIsSharing] = React.useState(false)

    const handleUserSelect = (user: User) => {
        setSelectedUsers(prev => [...prev, user])
    }

    const handleUserRemove = (userId: string) => {
        setSelectedUsers(prev => prev.filter(user => user.id !== userId))
    }

    const handleShare = async () => {
        if (selectedUsers.length === 0) {
            toast.error("Please select at least one user to share with")
            return
        }

        setIsSharing(true)
        try {
            const response = await fetch('/api/talks/share', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    talkId: talk.id,
                    recipientIds: selectedUsers.map(user => user.id),
                    message: message.trim() || undefined
                })
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to share talk')
            }

            const result = await response.json()

            toast.success(`Talk shared with ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`)

            // Reset form
            setSelectedUsers([])
            setMessage("")
            setOpen(false)

            // Call completion callback
            onShareComplete?.()

        } catch (error) {
            console.error('Share error:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to share talk')
        } finally {
            setIsSharing(false)
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            // Reset form when closing
            setSelectedUsers([])
            setMessage("")
        }
    }

    const triggerButton = variant === 'inline' ? (
        <button className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
            <Share2 className="w-5 h-5 text-gray-400 mr-3" />
            <div>
                <p className="font-medium">Share Talk</p>
                <p className="text-sm text-gray-500">Share with other users</p>
            </div>
        </button>
    ) : (
        <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Talk
        </Button>
    )

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {triggerButton}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Share Talk</DialogTitle>
                    <DialogDescription>
                        Share "{talk.title}&quot; with other users on the platform.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="users">Select users to share with</Label>
                        <UserSearchCombobox
                            selectedUsers={selectedUsers}
                            onUserSelect={handleUserSelect}
                            onUserRemove={handleUserRemove}
                            placeholder="Search for users to share with..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Optional message</Label>
                        <Textarea
                            id="message"
                            placeholder="Add a personal message (optional)..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                            {message.length}/500 characters
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isSharing}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleShare}
                        disabled={selectedUsers.length === 0 || isSharing}
                    >
                        {isSharing ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Sharing...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Share Talk
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}