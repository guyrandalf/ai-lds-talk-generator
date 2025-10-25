'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FormLoadingOverlay } from '@/components/ui/LoadingOverlay'
import { BaseUser } from '@/lib/types/auth/user'

interface ProfileUpdateFormProps {
    user: BaseUser
}

export default function ProfileUpdateForm({ user }: ProfileUpdateFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            try {
                const result = await updateProfile(formData)

                if (result.success) {
                    setMessage({ type: 'success', text: 'Profile updated successfully!' })
                    setIsEditing(false)
                    // Refresh the page to show updated data
                    window.location.reload()
                } else {
                    setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
                }
            } catch {
                setMessage({ type: 'error', text: 'An unexpected error occurred' })
            }
        })
    }

    return (
        <FormLoadingOverlay isLoading={isPending} loadingText="Updating profile...">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal information</CardDescription>
                        </div>
                        {!isEditing && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsEditing(true)
                                    setMessage(null)
                                }}
                            >
                                Edit
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {message && (
                        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {isEditing ? (
                        <form action={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        defaultValue={user.firstName}
                                        required
                                        placeholder="Enter your first name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        defaultValue={user.lastName}
                                        required
                                        placeholder="Enter your last name"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label>Email Address</Label>
                                    <div className="px-3 py-2 bg-muted rounded-md border">
                                        <p>{user.email}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                >
                                    {isPending ? 'Updating...' : 'Update Profile'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setMessage(null)
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <div className="px-3 py-2 bg-muted rounded-md border">
                                    <p>{user.firstName}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <div className="px-3 py-2 bg-muted rounded-md border">
                                    <p>{user.lastName}</p>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label>Email Address</Label>
                                <div className="px-3 py-2 bg-muted rounded-md border">
                                    <p>{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </FormLoadingOverlay>
    )
}