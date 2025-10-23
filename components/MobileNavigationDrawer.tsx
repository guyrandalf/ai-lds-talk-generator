'use client'

import Link from 'next/link'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { BookOpen, Menu, User, Settings, LayoutDashboard, Plus, Share2 } from 'lucide-react'
import LogoutButton from './auth/LogoutButton'

interface User {
    id: string
    firstName: string
    lastName: string
    email: string
}

interface MobileNavigationDrawerProps {
    user: User | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export default function MobileNavigationDrawer({ user, isOpen, onOpenChange }: MobileNavigationDrawerProps) {
    const handleLinkClick = () => {
        onOpenChange(false)
    }

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-gray-700 hover:text-blue-600 focus:text-blue-600"
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96">
                <SheetHeader className="pb-6">
                    <SheetTitle className="flex items-center space-x-2 text-left">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                            Pulpit Pal
                        </span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col space-y-6">
                    {user ? (
                        <>
                            {/* User Profile Section */}
                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                        {user.firstName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex flex-col space-y-2">
                                <Link
                                    href="/questionnaire"
                                    onClick={handleLinkClick}
                                    className="flex items-center space-x-3 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span className="font-medium">Create Talk</span>
                                </Link>

                                <Link
                                    href="/dashboard"
                                    onClick={handleLinkClick}
                                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    <span>Dashboard</span>
                                </Link>

                                <Link
                                    href="/shared-talks"
                                    onClick={handleLinkClick}
                                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <Share2 className="h-5 w-5" />
                                    <span>Shared Talks</span>
                                </Link>

                                <Link
                                    href="/settings"
                                    onClick={handleLinkClick}
                                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <Settings className="h-5 w-5" />
                                    <span>Settings</span>
                                </Link>
                            </nav>

                            {/* Logout Section */}
                            <div className="pt-4 border-t border-gray-200">
                                <div onClick={handleLinkClick}>
                                    <LogoutButton
                                        variant="mobile"
                                        className="text-red-600 hover:bg-red-50 hover:text-red-600"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Guest Navigation */}
                            <nav className="flex flex-col space-y-2">
                                <Link
                                    href="/auth/login"
                                    onClick={handleLinkClick}
                                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <User className="h-5 w-5" />
                                    <span>Sign In</span>
                                </Link>

                                <Link
                                    href="/auth/register"
                                    onClick={handleLinkClick}
                                    className="flex items-center space-x-3 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="h-5 w-5" />
                                    <span className="font-medium">Create Account</span>
                                </Link>
                            </nav>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}