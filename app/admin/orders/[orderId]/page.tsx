"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, ExternalLink, MessageSquare, Printer } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function AdminOrderDetailsPage({ params }: { params: { orderId: string } }) {
  const { toast } = useToast()
  // Mock order data - in a real app, you would fetch this based on the orderId
  const order = {
    id: params.orderId,
    orderNumber: "ORD-001",
    date: "2023-05-10",
    status: "completed",
    customer: {
      name: "James Koroma",
      email: "james.koroma@example.com",
      phone: "+232 76 123 4567",
      address: "15 Lumley Road, Freetown, Western Area",
      avatar: "/abstract-geometric-shapes.png",
    },
    farmer: {
      name: "Aminata Sesay",
      email: "aminata.sesay@example.com",
      phone: "+232 76 987 6543",
      location: "Bo, Southern Province",
      avatar: "/abstract-geometric-shapes.png",
    },
    items: [
      {
        id: "item1",
        name: "Fresh Cassava Roots",
        quantity: 5,
        unit: "kg",
        price: "Le 50,000",
        total: "Le 250,000",
        image: "/fresh-cassava.png",
      },
      {
        id: "item2",
        name: "Plantain Bunch",
        quantity: 2,
        unit: "bunch",
        price: "Le 75,000",
        total: "Le 150,000",
        image: "/plantains-bunch.png",
      },
      {
        id: "item3",
        name: "Palm Oil",
        quantity: 1,
        unit: "liter",
        price: "Le 50,000",
        total: "Le 50,000",
        image: "/palm-oil-plantation.png",
      },
    ],
    subtotal: "Le 450,000",
    deliveryFee: "Le 25,000",
    discount: "Le 0",
    total: "Le 475,000",
    paymentMethod: "Mobile Money",
    paymentStatus: "paid",
    deliveryMethod: "Standard Delivery",
    deliveryStatus: "delivered",
    notes: "Please deliver in the morning if possible.",
    timeline: [
      { date: "2023-05-10 09:15", status: "Order placed", description: "Order was placed by customer" },
      { date: "2023-05-10 09:30", status: "Payment confirmed", description: "Payment was confirmed via Mobile Money" },
      { date: "2023-05-10 10:45", status: "Order accepted", description: "Order was accepted by farmer" },
      { date: "2023-05-11 08:30", status: "Order prepared", description: "Products were prepared for delivery" },
      { date: "2023-05-11 14:20", status: "Out for delivery", description: "Order is out for delivery" },
      { date: "2023-05-11 16:45", status: "Delivered", description: "Order was delivered to customer" },
    ],
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
            <Badge
              className={
                order.status === "completed"
                  ? "bg-green-500"
                  : order.status === "processing"
                    ? "bg-[#438DBB]"
                    : order.status === "pending"
                      ? "bg-[#F5C451]"
                      : order.status === "disputed"
                        ? "bg-red-500"
                        : "bg-gray-500"
              }
            >
              {order.status}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  Order #{order.orderNumber} • {new Date(order.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          {item.quantity} {item.unit} x {item.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.total}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>{order.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount</span>
                    <span>{order.discount}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{order.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notes">Notes & Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 pt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Payment Method</span>
                          <span className="font-medium">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Payment Status</span>
                          <Badge className="bg-green-500">{order.paymentStatus}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Transaction ID</span>
                          <span className="font-medium">TXN123456789</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Delivery Method</span>
                          <span className="font-medium">{order.deliveryMethod}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Delivery Status</span>
                          <Badge className="bg-green-500">{order.deliveryStatus}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Tracking ID</span>
                          <span className="font-medium">TRK987654321</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative space-y-4 pl-6 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-gray-200">
                      {order.timeline.map((event, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-6 top-1 h-4 w-4 rounded-full bg-[#227C4F]"></div>
                          <div>
                            <p className="font-medium">{event.status}</p>
                            <p className="text-sm text-gray-500">{event.description}</p>
                            <p className="text-xs text-gray-400">{event.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <p className="text-sm">{order.notes || "No notes provided for this order."}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Add a Note</h4>
                        <Textarea placeholder="Enter a note about this order..." />
                        <Button className="mt-2 bg-[#227C4F] hover:bg-[#1b6a43]">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Add Note
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={order.customer.avatar || "/placeholder.svg"} alt={order.customer.name} />
                    <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{order.customer.name}</h4>
                    <p className="text-sm text-gray-500">{order.customer.email}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="font-medium">{order.customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Address</span>
                    <span className="text-right font-medium">{order.customer.address}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Farmer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={order.farmer.avatar || "/placeholder.svg"} alt={order.farmer.name} />
                    <AvatarFallback>{order.farmer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{order.farmer.name}</h4>
                    <p className="text-sm text-gray-500">{order.farmer.email}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Phone</span>
                    <span className="font-medium">{order.farmer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="font-medium">{order.farmer.location}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select defaultValue={order.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full bg-[#227C4F] hover:bg-[#1b6a43]"
                    onClick={() => {
                      toast({
                        title: "Order status updated",
                        description: `Order ${order.orderNumber} status has been updated.`,
                      })
                    }}
                  >
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
