"use client"

import { Suspense } from "react"
import { CalendarDays, Package, ShoppingBag, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BuyerLayout, PageWrapper } from "@/components/layouts/app-layout"
import { StatsCard } from "@/components/ui/stats-card"
import { EmptyWishlist, EmptySearchResults } from "@/components/ui/empty-states"
import RecentOrdersSkeleton from "./loading"

export default function BuyerDashboardPage() {
  return (
    <BuyerLayout>
      <div className="container mx-auto px-4 py-8">
        <PageWrapper
          title="Buyer Dashboard"
          description="Welcome back, Aminata"
          actions={
            <Button className="bg-[#227C4F] hover:bg-[#1b6a43]">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Active Orders"
              value="3"
              description="Orders in progress"
              icon={<Package className="h-5 w-5" />}
            />
            <StatsCard
              title="Completed Orders"
              value="12"
              description="Successfully delivered"
              icon={<ShoppingBag className="h-5 w-5" />}
            />
            <StatsCard
              title="Saved Items"
              value="8"
              description="Products in wishlist"
              icon={<Star className="h-5 w-5" />}
            />
            <StatsCard
              title="Next Delivery"
              value="May 22"
              description="Estimated arrival"
              icon={<CalendarDays className="h-5 w-5" />}
            />
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="saved">Saved Items</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Suspense fallback={<RecentOrdersSkeleton />}>
                <RecentOrders />
              </Suspense>
            </TabsContent>

            <TabsContent value="recommended">
              <RecommendedProducts />
            </TabsContent>

            <TabsContent value="saved">
              <SavedItems />
            </TabsContent>

            <TabsContent value="notifications">
              <Notifications />
            </TabsContent>
          </Tabs>
        </PageWrapper>
      </div>
    </BuyerLayout>
  )
}

function DashboardCard({ title, value, description, icon }) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  )
}

function RecentOrders() {
  const orders = [
    {
      id: "ORD-7291",
      date: "May 18, 2025",
      status: "In Transit",
      total: "Le 450,000",
      items: 3,
    },
    {
      id: "ORD-6584",
      date: "May 15, 2025",
      status: "Delivered",
      total: "Le 275,000",
      items: 2,
    },
    {
      id: "ORD-5472",
      date: "May 10, 2025",
      status: "Delivered",
      total: "Le 620,000",
      items: 5,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Track and manage your recent purchases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white rounded-lg border"
            >
              <div className="flex flex-col mb-2 md:mb-0">
                <div className="flex items-center">
                  <span className="font-medium">{order.id}</span>
                  <Badge
                    className={`ml-2 ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-[#F5C451] bg-opacity-20 text-[#8B6D1C]"
                    }`}
                  >
                    {order.status}
                  </Badge>
                </div>
                <span className="text-sm text-gray-500">{order.date}</span>
              </div>
              <div className="flex flex-col md:items-end">
                <span className="font-medium">{order.total}</span>
                <span className="text-sm text-gray-500">{order.items} items</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button variant="outline" className="w-full md:w-auto">
            View All Orders
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RecommendedProducts() {
  const products = [
    {
      id: 1,
      name: "Fresh Cassava",
      price: "Le 75,000",
      unit: "per bag",
      image: "/fresh-cassava.png",
      farm: "Bo City Farm",
    },
    {
      id: 2,
      name: "Sweet Potatoes",
      price: "Le 60,000",
      unit: "per bag",
      image: "/roasted-sweet-potatoes.png",
      farm: "Makeni Farms",
    },
    {
      id: 3,
      name: "Plantains",
      price: "Le 45,000",
      unit: "per bunch",
      image: "/plantains-bunch.png",
      farm: "Kenema Growers",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended For You</CardTitle>
        <CardDescription>Based on your purchase history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border">
              <div className="h-40 overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.farm}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">{product.price}</span>
                  <span className="text-xs text-gray-500">{product.unit}</span>
                </div>
                <Button className="w-full mt-3 bg-[#227C4F] hover:bg-[#1b6a43]" size="sm">
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SavedItems() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Items</CardTitle>
        <CardDescription>Products you've saved for later</CardDescription>
      </CardHeader>
      <CardContent>
        <EmptyWishlist onBrowseProducts={() => window.location.href = '/products'} />
      </CardContent>
    </Card>
  )
}

function Notifications() {
  const notifications = [
    {
      id: 1,
      title: "Order Shipped",
      message: "Your order #ORD-7291 has been shipped and is on its way.",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Price Drop Alert",
      message: "Good news! Fresh Cassava price has dropped by 10%.",
      time: "Yesterday",
      read: true,
    },
    {
      id: 3,
      title: "New Farmer in Your Area",
      message: "Freetown Organic Farms has joined FarmTrust. Check out their products!",
      time: "3 days ago",
      read: true,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Stay updated with your orders and activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${notification.read ? "bg-white" : "bg-[#227C4F] bg-opacity-5 border-[#227C4F] border-opacity-20"}`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{notification.title}</h4>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="text-center">
          <Button variant="link" className="text-[#227C4F]">
            Mark All as Read
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
