"use client"

import React, { useState, useEffect } from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Home, MessageSquare, Package, ShoppingCart, Star, User } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/context/AuthContext"

interface VendorSidebarProps {
  children: React.ReactNode
}

interface VendorData {
  farmName?: string
  farmerType?: string
  businessName?: string
  businessType?: string
  _id: string
}

// Helper function to get display values
const getDisplayValues = (isLoading: boolean, vendorData: VendorData | null, user: any) => {
  if (isLoading) {
    return {
      name: "Loading...",
      subtitle: "Loading...",
      initials: "...",
      needsOnboarding: false
    }
  }
  
  if (vendorData) {
    const name = vendorData.farmName || vendorData.businessName || "Vendor"
    return {
      name: name,
      subtitle: vendorData.farmerType || vendorData.businessType,
      initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      needsOnboarding: false
    }
  }
  
  // Fallback for vendors without profile
  return {
    name: user?.name || "Vendor",
    subtitle: "Complete setup",
    initials: user?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "V",
    needsOnboarding: true
  }
}

export function VendorSidebar({ children }: VendorSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthContext()
  const [vendorData, setVendorData] = useState<VendorData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isActive = (path: string) => {
    return pathname === path
  }

  // Simplified vendor data fetching
  React.useEffect(() => {
    let isMounted = true
    
    const fetchVendorData = async () => {
      if (!user || user.role !== "vendor") {
        if (isMounted) setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/vendor/profile", {
          method: "GET",
          credentials: "include",
        })

        if (!isMounted) return

        if (response.ok) {
          const data = await response.json()
          setVendorData(data.vendor)
        } else if (response.status === 404) {
          setVendorData(null)
        } else {
          console.error("Failed to fetch vendor data:", response.statusText)
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    if (user) {
      fetchVendorData()
    } else {
      setIsLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [user])

  const navItems = [
    {
      name: "Dashboard",
      href: "/vendor/dashboard",
      icon: Home,
    },
    {
      name: "Products",
      href: "/vendor/products",
      icon: Package,
    },
    {
      name: "Orders",
      href: "/vendor/orders",
      icon: ShoppingCart,
    },
    {
      name: "Analytics",
      href: "/vendor/analytics",
      icon: BarChart3,
    },
    {
      name: "Messages",
      href: "/vendor/messages",
      icon: MessageSquare,
    },
    {
      name: "Reviews",
      href: "/vendor/reviews",
      icon: Star,
    },
    {
      name: "Profile",
      href: "/vendor/profile",
      icon: User,
    },
  ]

  // Get display values for current state
  const getDisplayName = () => {
    if (isLoading) return "Loading..."
    if (vendorData) return vendorData.farmName || vendorData.businessName
    return user?.name || "Vendor"
  }

  const getDisplaySubtitle = () => {
    if (isLoading) return "Loading..."
    if (vendorData) return vendorData.farmerType || vendorData.businessType
    return "Complete setup"
  }

  const getInitials = () => {
    if (isLoading) return "..."
    if (vendorData) {
      const name = vendorData.farmName || vendorData.businessName
      if (name) {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      }
    }
    return user?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "V"
  }

  const needsOnboarding = !isLoading && !vendorData && user?.role === "vendor"

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#F7FAF9]">
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 py-4">
            <div className="flex items-center px-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#227C4F]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-white"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                    <path d="M8.5 8.5v.01" />
                    <path d="M16 15.5v.01" />
                    <path d="M12 12v.01" />
                    <path d="M11 17v.01" />
                    <path d="M7 14v.01" />
                  </svg>
                </div>
                <span className="font-bold text-[#227C4F]">FarmTrust</span>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} className="gap-4">
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="/diverse-farmers-harvest.png" />
                <AvatarFallback>
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">
                  {getDisplayName()}
                </p>
                {needsOnboarding ? (
                  <Link 
                    href="/vendor/onboarding" 
                    className="truncate text-xs text-[#227C4F] hover:text-[#1b6a43] hover:underline cursor-pointer"
                  >
                    {getDisplaySubtitle()} →
                  </Link>
                ) : (
                  <p className="truncate text-xs text-muted-foreground">
                    {getDisplaySubtitle()}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" className="h-8 rounded-lg border-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <Button variant="outline" size="sm" className="rounded-lg border-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span>Notifications</span>
              </Button>
              <Button variant="default" size="sm" className="rounded-lg bg-[#227C4F] hover:bg-[#1b6a43]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                <span></span>
              </Button>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
