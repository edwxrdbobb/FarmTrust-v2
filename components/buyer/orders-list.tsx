import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, CheckCircle, Clock, Truck } from "lucide-react"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  date: string
  status: "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: OrderItem[]
}

interface OrdersListProps {
  orders: Order[]
}

export function OrdersList({ orders }: OrdersListProps) {
  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return "bg-yellow-400 text-yellow-800"
      case "shipped":
        return "bg-blue-400 text-blue-800"
      case "delivered":
        return "bg-green-400 text-green-800"
      case "cancelled":
        return "bg-red-400 text-red-800"
      default:
        return ""
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <CardHeader className="bg-gray-50 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{order.id}</CardTitle>
                <CardDescription>Placed on {formatDate(order.date)}</CardDescription>
              </div>
              <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 px-3 py-1 capitalize`}>
                {getStatusIcon(order.status)}
                {order.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Order Items</h3>
                <ul className="space-y-2">
                  {order.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span className="text-gray-600">
                        {item.quantity} × {item.name}
                      </span>
                      <span className="font-medium">Le {item.price.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>Le {order.total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between pt-0">
            <Button variant="ghost" size="sm" className="text-gray-500">
              Need Help?
            </Button>
            <Link href={`/orders/${order.id}`}>
              <Button variant="outline" size="sm" className="rounded-xl">
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
