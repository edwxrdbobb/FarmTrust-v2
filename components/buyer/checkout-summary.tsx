import { Separator } from "@/components/ui/separator"

interface CheckoutItem {
  id: string
  name: string
  price: number
  quantity: number
  unit: string
  image: string
  vendor: string
}

interface CheckoutSummaryProps {
  items: CheckoutItem[]
}

export function CheckoutSummary({ items }: CheckoutSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = 10000 // Le 10,000
  const tax = Math.round(subtotal * 0.05) // 5% tax
  const total = subtotal + deliveryFee + tax

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden sticky top-24">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
      </div>

      <div className="p-6">
        <ul className="space-y-4 mb-6">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  {item.quantity} × Le {item.price.toLocaleString()}/{item.unit}
                </p>
              </div>
              <div className="text-right">
                <span className="font-medium">Le {(item.price * item.quantity).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>Le {subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee</span>
            <span>Le {deliveryFee.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (5%)</span>
            <span>Le {tax.toLocaleString()}</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>Le {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
