"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentActivity } from "@/components/admin/recent-activity"
import { SalesChart } from "@/components/admin/sales-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardData {
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
  farmerRequests: {
    pending: number
    approvedThisWeek: number
    total: number
  }
  trustScores: {
    averageFarmerTrustScore: number
    averageBuyerTrustScore: number
    disputedTransactions: string
  }
}

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data.data)
      } else {
        setError('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500">Welcome to the FarmTrust admin panel</p>
          </div>
          <div className="flex gap-2">
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="freetown">Freetown</TabsTrigger>
                <TabsTrigger value="bo">Bo</TabsTrigger>
                <TabsTrigger value="makeni">Makeni</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <DashboardStats 
          metrics={dashboardData} 
          loading={loading} 
          error={error}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <SalesChart />
          <RecentActivity />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Farmer Verification Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Pending Requests</span>
                    <span className="text-sm font-bold text-[#F5C451]">
                      {dashboardData?.farmerRequests.pending || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Approved This Week</span>
                    <span className="text-sm font-bold text-green-500">
                      {dashboardData?.farmerRequests.approvedThisWeek || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Requests</span>
                    <span className="text-sm font-bold text-blue-500">
                      {dashboardData?.farmerRequests.total || 0}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div 
                      className="h-2 rounded-full bg-[#227C4F]" 
                      style={{ 
                        width: `${dashboardData?.farmerRequests.total ? 
                          ((dashboardData.farmerRequests.total - dashboardData.farmerRequests.pending) / dashboardData.farmerRequests.total * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {dashboardData?.farmerRequests.total ? 
                      `${Math.round((dashboardData.farmerRequests.total - dashboardData.farmerRequests.pending) / dashboardData.farmerRequests.total * 100)}% of requests processed` : 
                      'No requests yet'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trust Score Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Average Farmer Trust Score</span>
                    <span className="text-sm font-bold text-[#227C4F]">
                      {dashboardData?.trustScores.averageFarmerTrustScore || 0}/5
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Average Buyer Trust Score</span>
                    <span className="text-sm font-bold text-[#227C4F]">
                      {dashboardData?.trustScores.averageBuyerTrustScore || 0}/5
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Disputed Transactions</span>
                    <span className="text-sm font-bold text-red-500">
                      {dashboardData?.trustScores.disputedTransactions || '0%'}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div 
                      className="h-2 rounded-full bg-[#438DBB]" 
                      style={{ 
                        width: `${dashboardData?.trustScores.averageFarmerTrustScore ? 
                          (dashboardData.trustScores.averageFarmerTrustScore / 5 * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {dashboardData?.trustScores.averageFarmerTrustScore ? 
                      `${Math.round(dashboardData.trustScores.averageFarmerTrustScore / 5 * 100)}% of users have trust scores above 4.0` : 
                      'No trust scores available'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
