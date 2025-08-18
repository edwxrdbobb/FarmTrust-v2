import type { Metadata } from "next"
import Link from "next/link"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Clock, Download, MapPin, Phone, Printer, Truck, User } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Order Details | Vendor Dashboard",
  description: "View and manage order details",
}

// Mock order data
const order = {
  id: "ORD-1234",
  customer: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+232 76 123456",
    address: "15 Wilkinson Road, Freetown, Sierra Leone",
  },
  date: "2023-09-15",
  time: "14:30",
  amount: 75000,
  status: "pending",
  paymentMethod: "Cash on Delivery",
  paymentStatus: "pending",
  items: [
    {
      id: "PROD-1",
      name: "Fresh Cassava",
      quantity: 3,
      price: 25000,
      total: 75000,
    },
  ],
  notes: "Please deliver in the morning if possible.",
  timeline: [
    {
      status: "Order Placed",
      date: "2023-09-15",
      time: "14:30",
    },
  ],
}

export default function OrderDetailsPage({
  params,
}: {
  params: { orderId: string }
}) {
  return (
    <VendorSidebar>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/vendor/orders">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Order {params.orderId}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-gray-500">
            Placed on {order.date} at {order.time}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Products included in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 space-y-4 rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">{formatCurrency(0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Total</span>
                  <span className="font-bold text-gray-900">{formatCurrency(order.amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle>Order Timeline</CardTitle>
              <CardDescription>Track the progress of this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#227C4F] text-white">
                        <Clock className="h-4 w-4" />
                      </div>
                      {index < order.timeline.length - 1 && <div className="mt-2 h-full w-0.5 bg-gray-200" />}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-medium text-gray-900">{event.status}</p>
                      <p className="text-sm text-gray-500">
                        {event.date} at {event.time}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Next possible statuses */}
                <div className="flex gap-4 opacity-50">
                  <div className="relative flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="mt-2 h-full w-0.5 bg-gray-200" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-gray-900">Processing</p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                </div>

                <div className="flex gap-4 opacity-50">
                  <div className="relative flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="mt-2 h-full w-0.5 bg-gray-200" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-gray-900">Shipped</p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                </div>

                <div className="flex gap-4 opacity-50">
                  <div className="relative flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
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
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-gray-900">Delivered</p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
              <div className="text-sm text-gray-500">
                Current Status: <span className="font-medium">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue={order.status}>
                  <SelectTrigger className="w-[180px] rounded-lg">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="rounded-lg bg-[#227C4F] hover:bg-[#1b6a43]">Update</Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-gray-500">{order.customer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">{order.customer.phone}</p>
                  <p className="text-sm text-gray-500">Primary contact</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Delivery Address</p>
                  <p className="text-sm text-gray-500">{order.customer.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 h-5 w-5 text-gray-500"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-sm text-gray-500">{order.paymentMethod}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 h-5 w-5 text-gray-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                  <path d="M12 8v8" />
                </svg>
                <div>
                  <p className="font-medium">Payment Status</p>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Order Date</p>
                  <p className="text-sm text-gray-500">
                    {order.date} at {order.time}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Order Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start rounded-lg">
                <Printer className="mr-2 h-4 w-4" />
                Print Order
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-lg">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Contact Customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </VendorSidebar>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
  }

  const statusStyle = statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800 border-gray-200"

  return (
    <Badge variant="outline" className={`${statusStyle} rounded-md border px-2 py-0.5 text-xs font-medium capitalize`}>
      {status}
    </Badge>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    failed: "bg-red-100 text-red-800 border-red-200",
    refunded: "bg-purple-100 text-purple-800 border-purple-200",
  }

  const statusStyle = statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800 border-gray-200"

  return (
    <Badge variant="outline" className={`${statusStyle} rounded-md border px-2 py-0.5 text-xs font-medium capitalize`}>
      {status}
    </Badge>
  )
}
