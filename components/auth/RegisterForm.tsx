'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerUser } from '@/lib/actions/auth'
import { useAuth } from '@/hooks/useAuth'
import { User, Mail, Lock, AlertCircle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { ButtonLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { FormLoadingOverlay } from '@/components/ui/LoadingOverlay'
import { BaseComponentProps, LoadingProps } from '@/lib/types/components/common'
import { ErrorProps } from 'next/error'


interface RegisterFormProps extends BaseComponentProps, LoadingProps, ErrorProps { }

export default function RegisterForm({ }: RegisterFormProps = {}) {
    const [error, setError] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { setUser } = useAuth()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        try {
            const result = await registerUser(formData)

            if (result.success && result.data) {
                toast.success('Account created successfully! Welcome to Pulpit Pal.')
                // Immediately update the auth state with the returned user data for instant UI feedback
                setUser(result.data)
                router.push('/dashboard')
            } else {
                setError(result.error || 'Registration failed')
                toast.error(result.error || 'Registration failed. Please try again.')
            }
        } catch (error) {
            const errorMessage = 'An unexpected error occurred. Please try again.'
            setError(errorMessage)
            toast.error(errorMessage)
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <FormLoadingOverlay isLoading={isLoading} loadingText="Creating your account...">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="John"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Smith"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="john.smith@example.com"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            minLength={8}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Create a secure password"
                            disabled={isLoading}
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                        <Info className="w-4 h-4 mr-1" />
                        Must be at least 8 characters long
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    {isLoading ? (
                        <ButtonLoadingSpinner text="Creating Account..." />
                    ) : (
                        'Create Free Account'
                    )}
                </button>

                <div className="text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </form>
        </FormLoadingOverlay>
    )
}