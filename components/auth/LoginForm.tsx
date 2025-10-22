'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginUser } from '@/lib/actions/auth'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { useToast, toast } from '@/components/ui/Toast'
import { ButtonLoadingSpinner } from '@/components/ui/LoadingSpinner'
import { FormLoadingOverlay } from '@/components/ui/LoadingOverlay'

export default function LoginForm() {
    const [error, setError] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { addToast } = useToast()

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError('')

        try {
            const result = await loginUser(formData)

            if (result.success) {
                addToast(toast.success(
                    'Welcome back!',
                    'You have been successfully signed in.',
                    { duration: 3000 }
                ))
                router.push('/dashboard')
            } else {
                setError(result.error || 'Login failed')
                addToast(toast.error(
                    'Sign In Failed',
                    result.error || 'Please check your credentials and try again.'
                ))
            }
        } catch (error) {
            const errorMessage = 'An unexpected error occurred. Please try again.'
            setError(errorMessage)
            addToast(toast.error('Sign In Error', errorMessage))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <FormLoadingOverlay isLoading={isLoading} loadingText="Signing you in...">
            <form action={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl flex items-center">
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
                        <ButtonLoadingSpinner text="Signing In..." />
                    ) : (
                        'Sign In'
                    )}
                </button>

                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                            Create one here
                        </Link>
                    </p>
                </div>
            </form>
        </FormLoadingOverlay>
    )
}