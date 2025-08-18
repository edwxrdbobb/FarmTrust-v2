"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthContext } from "@/context/AuthContext"

interface LoginPageWrapperProps {
  children: React.ReactNode
}

function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case "vendor":
      return "/vendor/dashboard"
    case "admin":
      return "/admin/dashboard"
    case "buyer":
    default:
      return "/dashboard"
  }
}

export function LoginPageWrapper({ children }: LoginPageWrapperProps) {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && user) {
      const redirectParam = searchParams.get("redirect")
      
      if (redirectParam) {
        router.push(redirectParam)
      } else {
        const defaultRedirect = getRoleBasedRedirect(user.role)
        router.push(defaultRedirect)
      }
    }
  }, [user, loading, router, searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return <>{children}</>
}