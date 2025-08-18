//@ts-nocheck
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  user: any | null
  accessToken: string | null
  isLoading: boolean
  setUser: (user: any | null) => void
  setAccessToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setAccessToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      localStorage.removeItem("user")
    }

    if (accessToken) {
      localStorage.setItem("auth_token", accessToken)
    } else {
      localStorage.removeItem("auth_token")
    }
  }, [user, accessToken])

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    setUser,
    setAccessToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
