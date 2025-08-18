"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus } from "lucide-react"
import { useCartContext } from "@/context/CartContext"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  unit: string
  image: string
  vendor: string
}

interface CartItemsProps {
  items: CartItem[]
}

export function CartItems({ items }: CartItemsProps) {
  const { updateQuantity, removeItem } = useCartContext();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Cart Items ({items.length})</h2>
      </div>

      <ul className="divide-y">
        {items.map((item) => (
          <li key={item.id} className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between">
                  <Link href={`/products/${item.id}`}>
                    <h3 className="font-semibold text-gray-800 hover:text-primary transition-colors">{item.name}</h3>
                  </Link>
                  <span className="font-semibold text-gray-800">
                    Le {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-500">{item.vendor}</p>
                <p className="text-sm text-gray-500">
                  Le {item.price.toLocaleString()}/{item.unit}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-l-lg"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                      <span className="sr-only">Decrease quantity</span>
                    </Button>

                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 1)}
                      className="h-8 w-12 rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-r-lg"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-red-500"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="sr-only sm:not-sr-only">Remove</span>
                  </Button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
