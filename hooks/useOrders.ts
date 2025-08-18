"use client"

import { useState, useCallback } from "react"

interface OrderItem {
  _id: string
  product: {
    _id: string
    name: string
    price: number
    images: string[]
  }
  quantity: number
  price: number
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
  shippingAddress: {
    fullName: string
    address: string
    city: string
    phone: string
  }
  vendor?: {
    _id: string
    business_name?: string
    first_name?: string
    last_name?: string
  }
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/orders', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    orders,
    loading,
    error,
    fetchOrders,
  }
}
