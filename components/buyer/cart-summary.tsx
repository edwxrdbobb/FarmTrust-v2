import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowRight } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  unit: string
  vendor: string
}

interface CartSummaryProps {
  items: CartItem[]
}

export function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = 10000 // Le 10,000
  const tax = Math.round(subtotal * 0.05) // 5% tax
  const total = subtotal + deliveryFee + tax

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-24">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">Le {subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-medium">Le {deliveryFee.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Tax (5%)</span>
          <span className="font-medium">Le {tax.toLocaleString()}</span>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>Le {total.toLocaleString()}</span>
        </div>

        <div className="pt-4">
          <Link href="/checkout">
            <Button className="w-full rounded-xl">
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          By proceeding to checkout, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
