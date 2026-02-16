"use client"

import { createContext, useContext, ReactNode } from "react"
import { BaseUser } from "@/lib/types/auth/user"

interface AuthContextType {
  user: BaseUser | null
  loading: boolean
  refreshUser: () => Promise<void>
  setUser: (user: BaseUser | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser: BaseUser | null
}) {
  const refreshUser = async () => {
    const { getCurrentUser } = await import("@/lib/actions/auth")
    const updatedUser = await getCurrentUser()
    // Note: This doesn't update state directly — implement useReducer if refresh needed
  }

  return (
    <AuthContext.Provider
      value={{
        user: initialUser,
        loading: false,
        refreshUser,
        setUser: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
