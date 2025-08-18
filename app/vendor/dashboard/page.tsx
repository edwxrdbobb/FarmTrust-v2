"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/AuthContext"
import Link from "next/link"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowUpRight, DollarSign, Package, ShoppingCart, Star, Users, AlertCircle, TrendingUp, MessageSquare, RefreshCw } from "lucide-react"
import { VendorRecentOrders } from "@/components/vendor/vendor-recent-orders"
import { VendorProductsTable } from "@/components/vendor/vendor-products-table"
import { VendorSalesChart } from "@/components/vendor/vendor-sales-chart"
import { PageWrapper } from "@/components/layouts/app-layout"
import { StatsCard, SalesStatsCard, CountStatsCard, RatingStatsCard } from "@/components/ui/stats-card"
import { PageLoading, DashboardLoadingSkeleton, ErrorState } from "@/components/ui/loading-states"
import { toast } from "@/components/ui/use-toast"

export default function VendorDashboardPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [vendorData, setVendorData] = useState<any>(null)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch dashboard data
  const fetchDashboardData = async (isRefresh = false) => {
    if (!user || user.role !== "vendor") {
      setIsLoading(false)
      return
    }

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      // Fetch vendor profile
      const response = await fetch("/api/vendor/profile", {
        method: "GET",
        credentials: "include",
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache"
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVendorData(data.vendor)
        
        // Fetch dashboard stats
        const statsResponse = await fetch("/api/vendor/dashboard", {
          credentials: "include",
          cache: "no-cache"
        })
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setDashboardStats(statsData.stats)
        } else {
          throw new Error('Failed to fetch dashboard statistics')
        }
        
        if (isRefresh) {
          toast({
            title: "Dashboard refreshed",
            description: "Your dashboard data has been updated"
          })
        }
      } else if (response.status === 404) {
        router.push("/vendor/onboarding")
        return
      } else {
        throw new Error('Failed to fetch vendor profile')
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError(error instanceof Error ? error.message : "Something went wrong")
      
      if (isRefresh) {
        toast({
          title: "Refresh failed",
          description: "Failed to update dashboard data. Please try again.",
          variant: "destructive"
        })
      }
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  // Check vendor profile and redirect to onboarding if needed
  useEffect(() => {
    fetchDashboardData()
  }, [user, router])

  // Refresh handler
  const handleRefresh = () => {
    fetchDashboardData(true)
  }

  // Show loading state
  if (isLoading) {
    return (
      <VendorSidebar>
        <PageLoading title="Loading dashboard..." description="Please wait while we fetch your data." />
      </VendorSidebar>
    )
  }

  // Show error state
  if (error) {
    return (
      <VendorSidebar>
        <ErrorState 
          title="Dashboard Error" 
          description={error}
          onRetry={handleRefresh}
          retryText="Retry"
        />
      </VendorSidebar>
    )
  }

  // Show dashboard only if vendor profile exists
  if (!vendorData) {
    return null // Will redirect to onboarding
  }
  return (
    <VendorSidebar>
      <PageWrapper
        title="Dashboard"
        description={`Welcome back, ${<span className="text-green-400 font-bold">{vendorData?.businessName || user?.name || 'there'}</span>}. Here's what's happening with your farm today.`}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#227C4F] text-white">Verified Farmer</Badge>
              <Badge className="bg-[#F5C451] text-gray-800">4.8 Rating</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Link href="/vendor/products/new">
                <Button size="sm" className="bg-[#227C4F] hover:bg-[#1b6a43] gap-2">
                  <Package className="h-4 w-4" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SalesStatsCard
            title="Total Sales"
            amount={dashboardStats?.totalSales || 0}
            change={12.5}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <CountStatsCard
            title="Active Products"
            count={dashboardStats?.activeProducts || 0}
            description="Products available"
            icon={<Package className="h-5 w-5" />}
          />
          <CountStatsCard
            title="Pending Orders"
            count={dashboardStats?.pendingOrders || 0}
            change={3}
            description="Orders to process"
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          <RatingStatsCard
            title="Customer Rating"
            rating={dashboardStats?.averageRating}
            totalReviews={56}
            icon={<Star className="h-5 w-5" />}
          />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <VendorSalesChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Recent Orders</CardTitle>
            <Link href="/vendor/orders">
              <Button variant="ghost" size="sm" className="gap-1 text-[#227C4F]">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <VendorRecentOrders />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Top Products</CardTitle>
            <Link href="/vendor/products">
              <Button variant="ghost" size="sm" className="gap-1 text-[#227C4F]">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <VendorProductsTable />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-white p-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New order received</p>
                      <p className="text-xs text-gray-500">Order #1234 for 5kg of cassava from John Doe</p>
                    </div>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-white p-3">
                    <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                      <Star className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New review</p>
                      <p className="text-xs text-gray-500">5-star review from Aminata for your plantains</p>
                    </div>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-white p-3">
                    <div className="rounded-full bg-green-100 p-2 text-green-600">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New follower</p>
                      <p className="text-xs text-gray-500">Mohamed from Freetown is now following your farm</p>
                    </div>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="orders">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-white p-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New order received</p>
                      <p className="text-xs text-gray-500">Order #1234 for 5kg of cassava from John Doe</p>
                    </div>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-white p-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Order shipped</p>
                      <p className="text-xs text-gray-500">Order #1230 has been shipped to Freetown</p>
                    </div>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-white p-3">
                    <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                      <Star className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New review</p>
                      <p className="text-xs text-gray-500">5-star review from Aminata for your plantains</p>
                    </div>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="messages">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-white p-3">
                    <div className="rounded-full bg-purple-100 p-2 text-purple-600">
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
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New message</p>
                      <p className="text-xs text-gray-500">Message from John about order delivery time</p>
                    </div>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        </div>
      </PageWrapper>
    </VendorSidebar>
  )
}
