"use client"

import { ReactNode } from "react"
import { useAuthContext } from "@/context/AuthContext"
import { SiteHeader } from "@/components/common/site-header"
import { SiteFooter } from "@/components/common/site-footer"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"
import { AdminLayout } from "@/components/admin/admin-layout"

interface AppLayoutProps {
  children: ReactNode
  type?: "public" | "buyer" | "vendor" | "admin"
  showHeader?: boolean
  showFooter?: boolean
  className?: string
}

export function AppLayout({ 
  children, 
  type = "public",
  showHeader = true,
  showFooter = true,
  className 
}: AppLayoutProps) {
  const { user } = useAuthContext()
  
  // Auto-detect layout type based on user role if not specified
  const layoutType = type === "public" && user ? user.role : type

  switch (layoutType) {
    case "admin":
      return (
        <AdminLayout>
          {children}
        </AdminLayout>
      )
    
    case "vendor":
      return (
        <VendorSidebar>
          {children}
        </VendorSidebar>
      )
    
    case "buyer":
    case "public":
    default:
      return (
        <div className={`min-h-screen flex flex-col bg-[#F7FAF9] ${className}`}>
          {showHeader && <SiteHeader />}
          <main className="flex-1">
            {children}
          </main>
          {showFooter && <SiteFooter />}
        </div>
      )
  }
}

// Specific layout components for different sections
export function PublicLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AppLayout type="public" className={className}>
      {children}
    </AppLayout>
  )
}

export function BuyerLayout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AppLayout type="buyer" className={className}>
      {children}
    </AppLayout>
  )
}

export function VendorLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout type="vendor">
      {children}
    </AppLayout>
  )
}

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout type="admin">
      {children}
    </AppLayout>
  )
}

// Page wrapper for consistent page structure
interface PageWrapperProps {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageWrapper({ 
  children, 
  title, 
  description, 
  actions, 
  className 
}: PageWrapperProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {(title || description || actions) && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          {(title || description) && (
            <div>
              {title && <h1 className="text-2xl font-bold text-gray-800">{title}</h1>}
              {description && <p className="text-gray-500 mt-1">{description}</p>}
            </div>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
