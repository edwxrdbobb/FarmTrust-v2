"use client"

import { CartItems } from "@/components/buyer/cart-items"
import { CartSummary } from "@/components/buyer/cart-summary"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useCartContext } from "@/context/CartContext"

export function CartClient() {
  const { items: cartItems, total } = useCartContext()
  const hasItems = cartItems.length > 0

  return (
    <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Shopping Cart</h1>
        <p className="text-gray-500">Review and manage your selected items</p>
      </div>

      {hasItems ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems items={cartItems} />

            <div className="mt-6">
              <Link href="/products">
                <Button variant="outline" className="rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          <div>
            <CartSummary items={cartItems} />
          </div>
        </div>
      ) : (
        <div className="text-center py-16 space-y-6">
          <div className="mx-auto bg-gray-100 rounded-full p-6 w-24 h-24 flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Your cart is empty</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Looks like you haven't added any products to your cart yet. Browse our selection of fresh local produce.
          </p>
          <Link href="/products">
            <Button className="mt-4 rounded-xl">Browse Products</Button>
          </Link>
        </div>
      )}
    </main>
  )
}