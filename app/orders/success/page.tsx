"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/common/site-header"
import { SiteFooter } from "@/components/common/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ShoppingBag, Truck } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

// Metadata removed due to "use client" directive

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      // In a real app, you would fetch the order details here
      // For now, we'll use the orderId to display basic info
      setOrder({
        _id: orderId,
        orderNumber: `ORD-${new Date().getFullYear()}-${orderId.slice(-4)}`,
        createdAt: new Date().toLocaleDateString(),
        total: 0, // This would come from the actual order
        paymentMethod: "Mobile Money", // This would come from the actual order
        shippingAddress: {
          firstName: "John",
          lastName: "Doe",
          address: "123 Main Street",
          city: "Freetown",
          district: "Western Area Urban",
          phone: "76 123456"
        }
      });
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F7FAF9]">
        <SiteHeader />
        <main className="flex-1 container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-gray-500">Loading order details...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF9]">
      <SiteHeader />

      <main className="flex-1 container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-none shadow-md">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Order Successful!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-gray-600">Order Number</p>
              <p className="text-xl font-semibold text-gray-800">{order?.orderNumber}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Order Details</h3>

              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">{order?.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-medium">Le {order?.total?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">{order?.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Delivery Information</h3>

              <div className="bg-gray-50 p-4 rounded-xl space-y-1">
                <p className="font-medium">{order?.shippingAddress?.firstName} {order?.shippingAddress?.lastName}</p>
                <p className="text-gray-600">{order?.shippingAddress?.address}</p>
                <p className="text-gray-600">
                  {order?.shippingAddress?.city && order?.shippingAddress?.city !== "Freetown" 
                    ? `${order?.shippingAddress?.city}, ` 
                    : ""}
                  {order?.shippingAddress?.district}
                </p>
                <p className="text-gray-600">+232 {order?.shippingAddress?.phone}</p>
              </div>

              <div className="flex items-center gap-3 p-4 border border-primary/20 bg-primary/5 rounded-xl">
                <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm">Your order is being processed and will be delivered in 2-3 business days.</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/orders" className="w-full">
              <Button variant="outline" className="w-full rounded-xl">
                <ShoppingBag className="mr-2 h-4 w-4" />
                View My Orders
              </Button>
            </Link>
            <Link href="/products" className="w-full">
              <Button className="w-full rounded-xl">Continue Shopping</Button>
            </Link>
          </CardFooter>
        </Card>
      </main>

      <SiteFooter />
    </div>
  )
}
