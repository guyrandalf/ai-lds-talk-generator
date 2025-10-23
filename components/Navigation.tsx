'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/actions/auth'
import LogoutButton from './auth/LogoutButton'
import ThemeToggle from './ThemeToggle'
import { BookOpen } from 'lucide-react'

interface User {
    id: string
    firstName: string
    lastName: string
    email: string
}

function Navigation() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUser() {
            try {
                const currentUser = await getCurrentUser()
                setUser(currentUser)
            } catch (error) {
                console.error('Error fetching user:', error)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    if (loading) {
        return (
            <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 transition-colors">
                <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    LDS Talk Generator
                                </span>
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <ThemeToggle />
                            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-20 rounded"></div>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                LDS Talk Generator
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <ThemeToggle />
                        {user ? (
                            <>
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Welcome back, <span className="font-medium text-gray-900 dark:text-white">{user.firstName}</span>
                                    </div>
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            {user.firstName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <Link
                                        href="/questionnaire"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        Create Talk
                                    </Link>
                                    <Link
                                        href="/dashboard"
                                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                                    >
                                        Settings
                                    </Link>
                                    <LogoutButton />
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/auth/login"
                                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Create Account
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 transition-colors p-2">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navigation