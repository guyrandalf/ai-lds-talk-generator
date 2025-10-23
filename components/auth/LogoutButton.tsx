'use client'

import { logoutUser } from '@/lib/actions/auth'
import { useAuth } from '@/hooks/useAuth'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
    className?: string
    variant?: 'default' | 'mobile'
}

export default function LogoutButton({ className = '', variant = 'default' }: LogoutButtonProps) {
    const { setUser } = useAuth()
    const baseClasses = variant === 'mobile'
        ? 'w-full text-left px-3 py-2 text-red-700 hover:text-red-600 hover:bg-gray-50 rounded-md font-medium transition-colors flex items-center'
        : 'px-4 py-2 text-red-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-blue-400 font-medium transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center'

    const handleLogout = async () => {
        // Clear the user state immediately for instant UI feedback
        setUser(null)
        // Then perform the actual logout
        await logoutUser()
    }

    return (
        <form action={handleLogout} className={variant === 'mobile' ? 'w-full' : ''}>
            <button
                type="submit"
                className={`${baseClasses} ${className}`}
            >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
            </button>
        </form>
    )
}