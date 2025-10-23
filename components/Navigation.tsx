'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/actions/auth'
import LogoutButton from './auth/LogoutButton'
import MobileNavigationDrawer from './MobileNavigationDrawer'
import { useNavigation } from '@/hooks/useNavigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
    const { isMobileMenuOpen, toggleMobileMenu } = useNavigation()

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
            <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center space-x-2 group">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    LDS Talk Generator
                                </span>
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }

    return (
        <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                LDS Talk Generator
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {user ? (
                            <>
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm text-gray-600">
                                        Welcome back, <span className="font-medium text-gray-900">{user.firstName}</span>
                                    </div>
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                                            {user.firstName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <Button asChild className="shadow-sm hover:shadow-md">
                                        <Link href="/questionnaire">
                                            Create Talk
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" asChild>
                                        <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                                            Dashboard
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" asChild>
                                        <Link href="/settings" className="text-gray-700 hover:text-blue-600 font-medium">
                                            Settings
                                        </Link>
                                    </Button>
                                    <LogoutButton />
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Button variant="ghost" asChild>
                                    <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 font-medium">
                                        Sign In
                                    </Link>
                                </Button>
                                <Button asChild className="shadow-sm hover:shadow-md">
                                    <Link href="/auth/register">
                                        Create Account
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <MobileNavigationDrawer
                            user={user}
                            isOpen={isMobileMenuOpen}
                            onOpenChange={toggleMobileMenu}
                        />
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navigation