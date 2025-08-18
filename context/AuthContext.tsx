"use client"


import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  email: string
  name?: string
  role: "admin" | "vendor" | "buyer"
  phone?: string
  verified?: boolean
  image?: string
  premium_status?: boolean
} | null

type AuthContextType = {
  user: User
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: NonNullable<User> }>
  signUp: (data: { name: string; email: string; password: string; role: string }) => Promise<{ user: NonNullable<User> }>
  signOut: () => Promise<void>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)

  // Function to check auth state
  const checkAuth = async () => {
    console.log("🔍 AuthContext: Checking authentication state")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/me", { 
        method: "GET",
        credentials: "include" // Ensure cookies are included
      })
      console.log("🔍 AuthContext: /api/auth/me response status:", res.status)
      if (res.ok) {
        const data = await res.json()
        console.log("✅ AuthContext: User authenticated:", { id: data.user?.id, role: data.user?.role, email: data.user?.email })
        setUser(data.user)
      } else {
        console.log("❌ AuthContext: Authentication failed")
        setUser(null)
      }
    } catch (error) {
      console.log("❌ AuthContext: Authentication error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Function to refresh auth state
  const refreshAuth = async () => {
    await checkAuth()
  }

  // Check auth state on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("🔐 AuthContext: Starting sign in process")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensure cookies are included
        body: JSON.stringify({ email, password })
      })
      console.log("🔐 AuthContext: Login response status:", res.status)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Login failed")
      }
      const data = await res.json()
      console.log("✅ AuthContext: Login successful:", { id: data.user?.id, role: data.user?.role, email: data.user?.email })
      setUser(data.user)
      console.log("✅ AuthContext: User state updated:", data.user)
      return { user: data.user }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (data: { name: string; email: string; password: string; role: string }) => {
    console.log("📝 AuthContext: Starting sign up process for role:", data.role)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensure cookies are included
        body: JSON.stringify(data)
      })
      console.log("📝 AuthContext: Registration response status:", res.status)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Registration failed")
      }
      const responseData = await res.json()
      console.log("✅ AuthContext: Registration successful:", { id: responseData.user?.id, role: responseData.user?.role, email: responseData.user?.email })
      setUser(responseData.user)
      return { user: responseData.user }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { 
        method: "POST", 
        credentials: "include" 
      })
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshAuth }}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
