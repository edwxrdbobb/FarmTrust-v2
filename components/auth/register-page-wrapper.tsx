"use client"

import { ReactNode } from "react"

interface RegisterPageWrapperProps {
  children: ReactNode
}

/**
 * RegisterPageWrapper - Unlike LoginPageWrapper, this allows authenticated users
 * to access the registration page without being redirected.
 * This is useful for scenarios where you want to allow registration even if logged in.
 */
export function RegisterPageWrapper({ children }: RegisterPageWrapperProps) {
  // No authentication checking or redirects - just render the children
  return <>{children}</>
}
