"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useOrders } from "@/hooks/useOrders"
import { 
  ShoppingBag, 
  Package, 
  User, 
  Heart, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Plus
} from "lucide-react"

interface BuyerDashboardProps {
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
    role: string
  }
}

export function BuyerDashboard({ user }: BuyerDashboardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { orders, loading: ordersLoading, fetchOrders } = useOrders()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0
  })

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    if (orders.length > 0) {
      const totalOrders = orders.length
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
      const pendingOrders = orders.filter(order => 
        ['pending', 'processing', 'shipped'].includes(order.status)
      ).length
      const completedOrders = orders.filter(order => order.status === 'delivered').length

      setStats({
        totalOrders,
        totalSpent,
        pendingOrders,
        completedOrders
      })
    }
  }, [orders])

  const formatPrice = (price: number) => {
    return `Le ${price.toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'processing':
      case 'shipped':
        return <Package className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user.firstName || user.email}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Manage your orders and profile
                </p>
              </div>
              <div className="flex space-x-4">
                <Link href="/products">
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Browse Products
                  </Button>
                </Link>
                <Link href="/cart">
                  <Button variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(stats.totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Orders</span>
                  <Link href="/orders">
                    <Button variant="outline" size="sm">
                      View All Orders
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading orders...</p>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {getStatusIcon(order.status)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                Order #{order._id?.slice(-6)}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {order.items?.length} items • {formatPrice(order.total)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <Link href={`/orders/${order._id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start shopping to see your orders here
                    </p>
                    <Link href="/products">
                      <Button className="bg-emerald-500 hover:bg-emerald-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Shop Now
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Profile Information</span>
                    <Link href="/user/edit-profile">
                      <Button variant="outline" size="sm">
                        Edit Profile
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">First Name</label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {user.firstName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Name</label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {user.lastName || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                      <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {user.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {user.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/products" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                  <Link href="/cart" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Package className="w-4 h-4 mr-2" />
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/orders" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Clock className="w-4 h-4 mr-2" />
                      Order History
                    </Button>
                  </Link>
                  <Link href="/user/edit-profile" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
