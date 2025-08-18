"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Package, 
  Search, 
  Filter, 
  Calendar,
  User,
  MapPin,
  DollarSign,
  ShoppingCart
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable } from "@/components/admin/data-table"
import { useToast } from "@/hooks/use-toast"

type Order = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  vendorName: string
  vendorEmail: string
  status: string
  total: number
  items: number
  createdAt: string
  updatedAt: string
  deliveryAddress: {
    district: string
    city: string
    address: string
  }
}

const columns = [
  {
    accessorKey: "orderNumber",
    header: "Order #",
  },
  {
    accessorKey: "customerName",
    header: "Customer",
  },
  {
    accessorKey: "vendorName",
    header: "Vendor",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status")
      const statusStyles = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        confirmed: "bg-blue-100 text-blue-800 border-blue-200",
        shipped: "bg-purple-100 text-purple-800 border-purple-200",
        delivered: "bg-green-100 text-green-800 border-green-200",
        cancelled: "bg-red-100 text-red-800 border-red-200",
        pending_payment: "bg-orange-100 text-orange-800 border-orange-200",
      }
      return (
        <Badge variant="outline" className={statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800 border-gray-200"}>
          {status.replace('_', ' ').toUpperCase()}
        </Badge>
      )
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }: any) => {
      const total = row.getValue("total")
      return `Le ${total.toLocaleString()}`
    },
  },
  {
    accessorKey: "items",
    header: "Items",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }: any) => {
      const date = new Date(row.getValue("createdAt"))
      return date.toLocaleDateString()
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => {
      const order = row.original
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`/admin/orders/${order.id}`, '_blank')}
        >
          View
        </Button>
      )
    },
  },
]

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
  }, [activeTab, statusFilter, dateFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/admin/orders?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch orders")
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true
    return order.status === activeTab
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage and track all marketplace orders
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchOrders} disabled={loading}>
                {loading ? "Loading..." : "Apply Filters"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={filteredOrders} searchKey="orderNumber" searchPlaceholder="Search orders..." />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
