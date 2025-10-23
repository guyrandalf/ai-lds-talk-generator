'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getCurrentUser } from '@/lib/actions/auth'

interface User {
    id: string
    firstName: string
    lastName: string
    email: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    refreshUser: () => Promise<void>
    setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const refreshUser = async () => {
        try {
            setLoading(true)
            const currentUser = await getCurrentUser()
            setUser(currentUser)
        } catch (error) {
            console.error('Error fetching user:', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshUser()
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}