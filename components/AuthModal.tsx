'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { loginUser, registerUser } from '@/lib/actions/auth'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { User, AlertCircle, Info } from 'lucide-react'
import { ButtonLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Input } from './ui/input'
import { Button } from './ui/button'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    title?: string
    description?: string
}

export default function AuthModal({
    isOpen,
    onClose,
    onSuccess,
    title = "Sign in to save your talk",
    description = "Create an account or sign in to save your generated talk to your personal library."
}: AuthModalProps) {
    const [mode, setMode] = useState<'login' | 'register'>('login')
    const [error, setError] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const { setUser } = useAuth()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        try {
            const result = mode === 'login'
                ? await loginUser(formData)
                : await registerUser(formData)

            if (result.success && result.data) {
                const successMessage = mode === 'login'
                    ? 'Welcome back! You can now save your talk.'
                    : 'Account created successfully! You can now save your talk.'

                toast.success(successMessage)
                setUser(result.data)
                onSuccess?.()
                onClose()
            } else {
                setError(result.error || `${mode === 'login' ? 'Login' : 'Registration'} failed`)
            }
        } catch (error) {
            const errorMessage = 'An unexpected error occurred. Please try again.'
            setError(errorMessage)
            console.error(`${mode} error:`, error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${mode === 'login'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                            disabled={isLoading}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${mode === 'register'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                            disabled={isLoading}
                        >
                            Create Account
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            required
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                            placeholder="John"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            required
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                            placeholder="Doe"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                    placeholder="Enter your email"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Input
                                    type="password"
                                    id="password"
                                    name="password"
                                    required
                                    minLength={mode === 'register' ? 8 : undefined}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                    placeholder={mode === 'login' ? 'Enter your password' : 'Create a secure password'}
                                    disabled={isLoading}
                                />
                            </div>
                            {mode === 'register' && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                    <Info className="w-3 h-3 mr-1" />
                                    Must be at least 8 characters long
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center text-sm">
                                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                        >
                            {isLoading ? (
                                <ButtonLoadingSpinner text={mode === 'login' ? 'Signing In...' : 'Creating Account...'} />
                            ) : (
                                mode === 'login' ? 'Sign In' : 'Create Account'
                            )}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}