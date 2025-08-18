"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileCheck,
  ShoppingCart,
  Package,
  AlertTriangle,
  Shield,
  BarChart3,
  Settings,
  Menu,
  X,
  User,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Sidebar from "./sidebar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
      active: pathname === "/admin/dashboard",
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      active: pathname === "/admin/users" || pathname.startsWith("/admin/users/"),
    },
    {
      label: "Farmer Requests",
      icon: FileCheck,
      href: "/admin/farmer-requests",
      active: pathname === "/admin/farmer-requests" || pathname.startsWith("/admin/farmer-requests/"),
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "/admin/orders",
      active: pathname === "/admin/orders" || pathname.startsWith("/admin/orders/"),
    },
    {
      label: "Products",
      icon: Package,
      href: "/admin/products",
      active: pathname === "/admin/products" || pathname.startsWith("/admin/products/"),
    },
    {
      label: "Disputes",
      icon: AlertTriangle,
      href: "/admin/disputes",
      active: pathname === "/admin/disputes",
    },
    {
      label: "Escrow Management",
      icon: Lock,
      href: "/admin/escrow",
      active: pathname === "/admin/escrow",
    },
    {
      label: "Trust Management",
      icon: Shield,
      href: "/admin/trust",
      active: pathname === "/admin/trust",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/admin/analytics",
      active: pathname === "/admin/analytics",
    },
    {
      label: "Profile",
      icon: User,
      href: "/admin/profile",
      active: pathname === "/admin/profile",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      active: pathname === "/admin/settings",
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#F7FAF9]">
      {/* Mobile sidebar toggle */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full bg-white"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar routes={routes} />

      {/* Main content */}
      <div className="flex-1 overflow-auto ml-64">
        <div className="container mx-auto py-6">{children}</div>
      </div>
    </div>
  )
}
