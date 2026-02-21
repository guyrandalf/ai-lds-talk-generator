"use client"

import { createContext, useContext, useState, ReactNode } from "react"
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
  const [user, setUser] = useState<BaseUser | null>(initialUser)

  const refreshUser = async () => {
    const { getCurrentUser } = await import("@/lib/actions/auth")
    const updatedUser = await getCurrentUser()
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        refreshUser,
        setUser,
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
