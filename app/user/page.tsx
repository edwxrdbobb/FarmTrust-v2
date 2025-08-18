"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/AuthContext"
import { BuyerDashboard } from "@/components/buyer/buyer-dashboard"
import { Loader2 } from "lucide-react"

export default function UserDashboardPage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/user")
    } else if (!loading && user && user.role !== "buyer") {
      // Redirect non-buyers to appropriate dashboard
      switch (user.role) {
        case "vendor":
          router.push("/vendor/dashboard")
          break
        case "admin":
          router.push("/admin/dashboard")
          break
        default:
          router.push("/")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "buyer") {
    return null
  }

  return <BuyerDashboard user={user} />
}
