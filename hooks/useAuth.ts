"use client"

import { useState, useEffect } from "react"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Will check auth state with Supabase
    setLoading(false)
  }, [])

  return {
    user,
    loading,
    signIn: async () => {
      // Will be implemented
    },
    signOut: async () => {
      // Will be implemented
    },
  }
}
