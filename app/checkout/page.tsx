"use client"

import { SiteHeader } from "@/components/common/site-header"
import { SiteFooter } from "@/components/common/site-footer"
import { CheckoutForm } from "@/components/buyer/checkout-form"
import { CheckoutSummary } from "@/components/buyer/checkout-summary"
import { useCartContext } from "@/context/CartContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Metadata removed due to "use client" directive

export default function CheckoutPage() {
  const { items: cartItems, total } = useCartContext();
  const router = useRouter();

  // Redirect to cart if empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems.length, router]);

  // Show loading while redirecting
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F7FAF9]">
        <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <p className="text-gray-500">Redirecting to cart...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF9]">
      <main className="flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
          <p className="text-gray-500">Complete your order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CheckoutForm />
          </div>

          <div>
            <CheckoutSummary items={cartItems} />
          </div>
        </div>
      </main>
    </div>
  )
}
