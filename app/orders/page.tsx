"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/common/site-header"
import { SiteFooter } from "@/components/common/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Package, Clock, CheckCircle, XCircle, AlertCircle, Truck, MapPin } from "lucide-react"
import { formatCurrency } from "@/lib/sierra-leone-districts"

interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  unit: string
  image: string
  vendor: string
}

interface Order {
  _id: string
  orderNumber: string
  status: string
  createdAt: string
  total: number
  items: OrderItem[]
  deliveryAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    district: string
    phone: string
  }
  paymentMethod: string
  paymentStatus: string
}

const ORDER_STATUSES = [
  { value: "all", label: "All Orders", icon: Package },
  { value: "pending", label: "Pending", icon: Clock },
  { value: "confirmed", label: "Confirmed", icon: CheckCircle },
  { value: "shipped", label: "Shipped", icon: Truck },
  { value: "delivered", label: "Delivered", icon: CheckCircle },
  { value: "cancelled", label: "Cancelled", icon: XCircle },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending": return "bg-yellow-100 text-yellow-800"
    case "confirmed": return "bg-blue-100 text-blue-800"
    case "shipped": return "bg-purple-100 text-purple-800"
    case "delivered": return "bg-green-100 text-green-800"
    case "cancelled": return "bg-red-100 text-red-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending": return Clock
    case "confirmed": return CheckCircle
    case "shipped": return Truck
    case "delivered": return CheckCircle
    case "cancelled": return XCircle
    default: return Package
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        console.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeTab === "all" || order.status === activeTab
    const matchesSearch = searchTerm === "" || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesStatus && matchesSearch
  })

  const StatusIcon = getStatusIcon(activeTab)

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F7FAF9]">
        <SiteHeader />
        <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your orders...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF9]">
      <SiteHeader />

      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-500">Track your orders and delivery status</p>
        </div>

        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders by order number or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    <div className="flex items-center gap-2">
                      <status.icon className="h-4 w-4" />
                      {status.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || activeTab !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "You haven't placed any orders yet"
                  }
                </p>
                {!searchTerm && activeTab === "all" && (
                  <Button asChild>
                    <a href="/products">Start Shopping</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const StatusIcon = getStatusIcon(order.status)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
            <CardDescription>
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(order.status)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img 
                src={item.image || "/placeholder.svg"} 
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} × {formatCurrency(item.price)}/{item.unit}
                </p>
                <p className="text-xs text-gray-400">Vendor: {item.vendor}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.deliveryAddress.firstName} {order.deliveryAddress.lastName}</p>
              <p>{order.deliveryAddress.address}</p>
              <p>
                {order.deliveryAddress.city && order.deliveryAddress.city !== "Freetown" 
                  ? `${order.deliveryAddress.city}, ` 
                  : ""}
                {order.deliveryAddress.district}
              </p>
              <p>+232 {order.deliveryAddress.phone}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Order Summary</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-medium">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span>{order.paymentMethod === "mobile_money" ? "Mobile Money" : 
                       order.paymentMethod === "bank_transfer" ? "Bank Transfer" : 
                       "Cash on Delivery"}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>
                  {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            Track Order
          </Button>
          <Button variant="outline" size="sm">
            Contact Vendor
          </Button>
          {order.status === "delivered" && (
            <Button size="sm">
              Leave Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
