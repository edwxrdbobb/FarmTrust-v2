"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Leaf, Menu, X, User, LogOut, Settings, ShoppingCart } from "lucide-react"
import { ThemeToggle, ThemeToggleCompact } from "@/components/ui/theme-toggle"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthContext } from "@/context/AuthContext"
import { useCartContext } from "@/context/CartContext"
import { useRouter } from "next/navigation"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading, signOut } = useAuthContext()
  const { items } = useCartContext()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const cartItemCount = items.reduce((count, item) => count + item.quantity, 0)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const isActive = (path: string) => {
    return pathname === path
  } 

  const navItems = [
    { name: "Browse Products", href: "/products" },
    { name: "Our Farmers", href: "/vendors" },
    { name: "How It Works", href: "/how-it-works" },
  ]

  const getDashboardLink = () => {
    if (!user) return "/dashboard" // Default fallback
    switch (user.role) {
      case "admin":
        return "/admin/dashboard"
      case "vendor":
        return "/vendor/dashboard"
      default:
        return "/dashboard"
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setUserMenuOpen(false)
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full shadow-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-primary">FarmTrust</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-gray-700 dark:text-gray-300 hover:text-primary transition-colors",
                  isActive(item.href) && "text-primary font-medium",
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth/User Section */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <Link href="/cart" className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}
            {/* Theme Toggle */}
            <ThemeToggle />
            {loading ? (
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-500/50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {user.name?.charAt(0) || user.email.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {user.name || user.email}
                  </span>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    {loading ? (
                      <div className="flex items-center px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </div>
                    ) : (
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      href="/user/edit-profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="rounded-xl">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-primary hover:bg-primary/90 rounded-xl">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t mt-4">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-gray-700 hover:text-primary transition-colors py-2",
                    isActive(item.href) && "text-primary font-medium",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t">
                {/* Theme Toggle in Mobile */}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">Theme</span>
                  <ThemeToggleCompact />
                </div>
                {loading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                ) : user ? (
                  <>
                    <div className="px-3 py-2 bg-gray-50 rounded-xl">
                      <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl justify-start">
                        <div className="relative flex items-center">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {cartItemCount > 0 && (
                            <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                              {cartItemCount}
                            </span>
                          )}
                        </div>
                        Cart ({cartItemCount})
                      </Button>
                    </Link>
                    <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl justify-start text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-xl">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-primary hover:bg-primary/90 rounded-xl">Register</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
