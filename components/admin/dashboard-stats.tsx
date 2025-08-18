"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, Users, ShoppingBag, Truck, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardMetrics {
  users: {
    totalUsers: number
    newUsers: number
    activeUsers: number
  }
  sales: {
    totalRevenue: number
    totalOrders: number
  }
  orders: {
    pendingDeliveries: number
  }
  disputes: {
    activeDisputes: number
  }
}

interface DashboardStatsProps {
  metrics?: DashboardMetrics | null
  loading?: boolean
  error?: string | null
}

export function DashboardStats({ metrics, loading = false, error = null }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32 mb-4" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-4">
          <CardContent className="p-6">
            <p className="text-red-500">Error loading dashboard statistics: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.users.totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+{metrics.users.newUsers} from last month</p>
          <div className="mt-4 flex items-center text-xs text-green-500">
            <ArrowUpIcon className="mr-1 h-4 w-4" />
            <span>{metrics.users.newUsers > 0 ? 'Growing' : 'No growth'}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.sales.totalOrders.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Revenue: ${metrics.sales.totalRevenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center text-xs text-green-500">
            <ArrowUpIcon className="mr-1 h-4 w-4" />
            <span>Active</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.users.activeUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Users with recent activity</p>
          <div className="mt-4 flex items-center text-xs text-green-500">
            <ArrowUpIcon className="mr-1 h-4 w-4" />
            <span>Online</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Disputes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.disputes.activeDisputes}</div>
          <p className="text-xs text-muted-foreground">Pending resolution</p>
          <div className="mt-4 flex items-center text-xs text-orange-500">
            <AlertTriangle className="mr-1 h-4 w-4" />
            <span>Monitor</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
