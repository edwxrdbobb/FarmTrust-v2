"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { SiteHeader } from "@/components/common/site-header"
import { SiteFooter } from "@/components/common/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  DollarSign,
  CreditCard,
  AlertCircle
} from "lucide-react"
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

interface OrderStatus {
  status: string
  timestamp: string
  note?: string
  updatedBy: string
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
    notes?: string
  }
  paymentMethod: string
  paymentStatus: string
  statusHistory: OrderStatus[]
}

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

const getStatusDescription = (status: string) => {
  switch (status) {
    case "pending": return "Your order has been placed and is awaiting confirmation from the vendor."
    case "confirmed": return "Your order has been confirmed by the vendor and is being prepared for shipping."
    case "shipped": return "Your order has been shipped and is on its way to you."
    case "delivered": return "Your order has been successfully delivered to your address."
    case "cancelled": return "Your order has been cancelled."
    default: return "Order status unknown."
  }
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      } else if (response.status === 404) {
        setError("Order not found")
      } else {
        setError("Failed to load order details")
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      setError("Failed to load order details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F7FAF9]">
        <SiteHeader />
        <main className="flex-1 container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading order details...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F7FAF9]">
        <SiteHeader />
        <main className="flex-1 container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
              <p className="text-gray-500 mb-4">{error || "The order you're looking for doesn't exist."}</p>
              <Button asChild>
                <a href="/orders">Back to Orders</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const StatusIcon = getStatusIcon(order.status)

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF9]">
      <SiteHeader />

      <main className="flex-1 container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <a href="/orders">← Back to Orders</a>
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          <p className="text-gray-500">Order {order.orderNumber}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Status</CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{getStatusDescription(order.status)}</p>
                
                {/* Status Timeline */}
                <div className="space-y-3">
                  {order.statusHistory?.map((status, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(status.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {status.note && (
                          <p className="text-sm text-gray-600">{status.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <img 
                        src={item.image || "/placeholder.svg"} 
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">Vendor: {item.vendor}</p>
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
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{order.deliveryAddress.firstName} {order.deliveryAddress.lastName}</p>
                    <p className="text-gray-600">{order.deliveryAddress.address}</p>
                    <p className="text-gray-600">
                      {order.deliveryAddress.city && order.deliveryAddress.city !== "Freetown" 
                        ? `${order.deliveryAddress.city}, ` 
                        : ""}
                      {order.deliveryAddress.district}
                    </p>
                    <p className="text-gray-600 flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      +232 {order.deliveryAddress.phone}
                    </p>
                    {order.deliveryAddress.notes && (
                      <p className="text-sm text-gray-500 mt-2">
                        <strong>Notes:</strong> {order.deliveryAddress.notes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order Date:</span>
                  <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>Le 10,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>Le {Math.round(order.total * 0.05).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total + 10000 + Math.round(order.total * 0.05))}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
              </CardContent>
            </Card>

            {/* Customer Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                {order.status === "delivered" && (
                  <Button 
                    className="w-full"
                    onClick={() => router.push(`/orders/${orderId}/review`)}
                  >
                    Leave Review
                  </Button>
                )}
                {order.status !== "cancelled" && order.status !== "delivered" && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => router.push(`/orders/${orderId}/dispute`)}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    File Dispute
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
