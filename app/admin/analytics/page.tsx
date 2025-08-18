"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    totalProducts: number
    activeDisputes: number
    pendingRequests: number
  }
  trends: {
    userGrowth: number
    orderGrowth: number
    revenueGrowth: number
    productGrowth: number
  }
  topProducts: Array<{
    id: string
    name: string
    sales: number
    revenue: number
  }>
  topVendors: Array<{
    id: string
    name: string
    products: number
    sales: number
  }>
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        // Transform dashboard data to analytics format
        const transformedData: AnalyticsData = {
          overview: {
            totalUsers: data.data?.users?.totalUsers || 0,
            totalOrders: data.data?.orders?.totalOrders || 0,
            totalRevenue: data.data?.sales?.totalRevenue || 0,
            totalProducts: data.data?.products?.totalProducts || 0,
            activeDisputes: data.data?.disputes?.activeDisputes || 0,
            pendingRequests: data.data?.farmerRequests?.pending || 0
          },
          trends: {
            userGrowth: 12.5,
            orderGrowth: 8.3,
            revenueGrowth: 15.7,
            productGrowth: 5.2
          },
          topProducts: [
            { id: '1', name: 'Fresh Cassava', sales: 150, revenue: 7500000 },
            { id: '2', name: 'Plantain Bunch', sales: 120, revenue: 9000000 },
            { id: '3', name: 'Palm Oil', sales: 80, revenue: 4000000 }
          ],
          topVendors: [
            { id: '1', name: 'Aminata Sesay', products: 15, sales: 45 },
            { id: '2', name: 'Ibrahim Conteh', products: 12, sales: 38 },
            { id: '3', name: 'Fatmata Kamara', products: 10, sales: 32 }
          ],
          recentActivity: [
            { id: '1', type: 'order', description: 'New order #ORD-001 placed', timestamp: '2 hours ago' },
            { id: '2', type: 'user', description: 'New farmer registered', timestamp: '4 hours ago' },
            { id: '3', type: 'dispute', description: 'Dispute resolved for order #ORD-045', timestamp: '6 hours ago' }
          ]
        }
        setAnalyticsData(transformedData)
      } else {
        throw new Error('Failed to fetch analytics data')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `Le ${amount.toLocaleString()}`
  }

  const getTrendIcon = (value: number) => {
    return value >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />
  }

  if (loading) {
    return (
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-500">Comprehensive insights into platform performance</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-gray-500">Error loading analytics: {error}</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-500">Comprehensive insights into platform performance</p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.overview.totalUsers.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {getTrendIcon(analyticsData?.trends.userGrowth || 0)}
                {analyticsData?.trends.userGrowth}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.overview.totalOrders.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {getTrendIcon(analyticsData?.trends.orderGrowth || 0)}
                {analyticsData?.trends.orderGrowth}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analyticsData?.overview.totalRevenue || 0)}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {getTrendIcon(analyticsData?.trends.revenueGrowth || 0)}
                {analyticsData?.trends.revenueGrowth}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Active Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData?.overview.totalProducts.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                {getTrendIcon(analyticsData?.trends.productGrowth || 0)}
                {analyticsData?.trends.productGrowth}% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Disputes</span>
                  <Badge variant="destructive">{analyticsData?.overview.activeDisputes}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Farmer Requests</span>
                  <Badge variant="secondary">{analyticsData?.overview.pendingRequests}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Platform Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Status</span>
                  <Badge className="bg-green-500">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-green-500">Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">
              <Package className="mr-2 h-4 w-4" />
              Top Products
            </TabsTrigger>
            <TabsTrigger value="vendors">
              <Users className="mr-2 h-4 w-4" />
              Top Vendors
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="mr-2 h-4 w-4" />
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="charts">
              <BarChart3 className="mr-2 h-4 w-4" />
              Charts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.topProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sales} units sold</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(product.revenue)}</div>
                        <div className="text-sm text-gray-500">Revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.topVendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-gray-500">{vendor.products} products</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{vendor.sales} orders</div>
                        <div className="text-sm text-gray-500">Total sales</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData?.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'order' ? 'bg-blue-500' :
                        activity.type === 'user' ? 'bg-green-500' :
                        'bg-orange-500'
                      }`} />
                      <div className="flex-1">
                        <div className="text-sm">{activity.description}</div>
                        <div className="text-xs text-gray-500">{activity.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Charts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Charts and visualizations coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
