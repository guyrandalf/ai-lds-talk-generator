'use client'

import Link from 'next/link'
import LogoutButton from './auth/LogoutButton'
import MobileNavigationDrawer from './MobileNavigationDrawer'
import { useNavigation } from '@/hooks/useNavigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'

function Navigation() {
    const { user, loading } = useAuth()
    const { isMobileMenuOpen, toggleMobileMenu } = useNavigation()

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
                                    Pulpit Pal
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
                                Pulpit Pal
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {user ? (
                            <>
                                <div className="flex items-center space-x-6">
                                    <Button variant="ghost" asChild>
                                        <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                                            Dashboard
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" asChild>
                                        <Link href="/shared-talks" className="text-gray-700 hover:text-blue-600 font-medium">
                                            Shared Talks
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
                                <Button asChild className="shadow-sm hover:shadow-md text-white bg-blue-600 hover:bg-blue-700">
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