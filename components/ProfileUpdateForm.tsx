'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/lib/actions/auth'

interface User {
    id: string
    email: string
    firstName: string
    lastName: string
}

interface ProfileUpdateFormProps {
    user: User
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                        <p className="text-gray-600 text-sm">Update your personal information</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => {
                                setIsEditing(true)
                                setMessage(null)
                            }}
                            className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>
            <div className="p-6">
                {message && (
                    <div className={`mb-4 p-4 rounded-xl ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.text}
                    </div>
                )}

                {isEditing ? (
                    <form action={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    defaultValue={user.firstName}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-colors"
                                    placeholder="Enter your first name"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    defaultValue={user.lastName}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 transition-colors"
                                    placeholder="Enter your last name"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="text-gray-900">{user.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {isPending ? 'Updating...' : 'Update Profile'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false)
                                    setMessage(null)
                                }}
                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name
                            </label>
                            <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="text-gray-900">{user.firstName}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name
                            </label>
                            <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="text-gray-900">{user.lastName}</p>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="text-gray-900">{user.email}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}