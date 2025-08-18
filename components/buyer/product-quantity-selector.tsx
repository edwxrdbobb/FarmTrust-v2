"use client"

import type React from "react"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProductQuantitySelectorProps {
  maxQuantity: number
  unit: string
  available: boolean
}

export function ProductQuantitySelector({ maxQuantity, unit, available }: ProductQuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1)

  const increment = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1)
    }
  }

  const decrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
      setQuantity(value)
    }
  }

  if (!available) {
    return <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg">This product is currently out of stock.</div>
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-l-lg rounded-r-none border-r-0"
          onClick={decrement}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
          <span className="sr-only">Decrease quantity</span>
        </Button>
        <Input
          type="number"
          min={1}
          max={maxQuantity}
          className="h-10 w-20 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          value={quantity}
          onChange={handleChange}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-r-lg rounded-l-none border-l-0"
          onClick={increment}
          disabled={quantity >= maxQuantity}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Increase quantity</span>
        </Button>
        <span className="ml-3 text-sm text-gray-500">
          {unit} ({maxQuantity} available)
        </span>
      </div>
    </div>
  )
}
