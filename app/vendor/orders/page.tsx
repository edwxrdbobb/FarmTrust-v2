"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Package, Clock, CheckCircle, XCircle, Truck, MapPin, User, Phone, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"

interface OrderItem {
  productId: string
  name: string
  quantity: number
  price: number
  unit: string
  image: string
}

interface Order {
  _id: string
  orderNumber: string
  status: string
  createdAt: string
  total: number
  items: OrderItem[]
  buyer: {
    firstName: string
    lastName: string
    email: string
  }
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

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updateStatus, setUpdateStatus] = useState("")
  const [statusNote, setStatusNote] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

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

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !updateStatus) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: updateStatus,
          note: statusNote,
        }),
      })

      if (response.ok) {
        toast({
          title: "Order Status Updated",
          description: `Order ${selectedOrder.orderNumber} status updated to ${updateStatus}`,
        })
        
        // Refresh orders
        await fetchOrders()
        setSelectedOrder(null)
        setUpdateStatus("")
        setStatusNote("")
      } else {
        throw new Error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeTab === "all" || order.status === activeTab
    const matchesSearch = searchTerm === "" || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      `${order.buyer.firstName} ${order.buyer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      confirmed: orders.filter(o => o.status === "confirmed").length,
      shipped: orders.filter(o => o.status === "shipped").length,
      delivered: orders.filter(o => o.status === "delivered").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    }
    return stats
  }

  const stats = getOrderStats()

  if (loading) {
    return (
      <VendorSidebar>
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading orders...</p>
        </div>
      </VendorSidebar>
    )
  }

  return (
    <VendorSidebar>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-500">Manage and process customer orders</p>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-500">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
              <div className="text-sm text-gray-500">Shipped</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              <div className="text-sm text-gray-500">Delivered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-gray-500">Cancelled</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders by order number, product name, or customer name..."
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
                <p className="text-gray-500">
                  {searchTerm || activeTab !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "You don't have any orders yet"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <VendorOrderCard 
                  key={order._id} 
                  order={order} 
                  onStatusUpdate={(order) => setSelectedOrder(order)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status Update Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Update the status for order {selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">New Status</label>
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Note (Optional)</label>
                <Textarea
                  placeholder="Add a note about this status update..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={!updateStatus || isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </VendorSidebar>
  )
}

function VendorOrderCard({ order, onStatusUpdate }: { order: Order, onStatusUpdate: (order: Order) => void }) {
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
            {order.status === "pending" && (
              <Button size="sm" onClick={() => onStatusUpdate(order)}>
                Update Status
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Customer Information */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
          <User className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium">{order.buyer.firstName} {order.buyer.lastName}</p>
            <p className="text-sm text-gray-600">{order.buyer.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span className="text-sm">+232 {order.deliveryAddress.phone}</span>
          </div>
        </div>

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
            Contact Customer
          </Button>
          <Button variant="outline" size="sm">
            View Details
          </Button>
          {order.status !== "pending" && (
            <Button size="sm" onClick={() => onStatusUpdate(order)}>
              Update Status
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
