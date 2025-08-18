"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface Product {
  _id: string
  name: string
  price: number
  unit: string
  stock: number
  soldCount?: number
}

export function VendorProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopProducts()
  }, [])

  const fetchTopProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?vendor=current&limit=5&sortBy=sales')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching top products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#227C4F]"></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No products found. <Link href="/vendor/products/new" className="text-[#227C4F] hover:underline">Add your first product</Link></p>
      </div>
    )
  }

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Sales</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                {formatCurrency(product.price)}/{product.unit}
              </TableCell>
              <TableCell>
                <StockBadge stock={product.stock || 0} />
              </TableCell>
              <TableCell>{product.soldCount || 0} units</TableCell>
              <TableCell className="text-right">
                <Link href={`/vendor/products/${product._id}/edit`}>
                  <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[#227C4F]">
                    Edit
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function StockBadge({ stock }: { stock: number }) {
  let badgeClass = ""
  let label = ""

  if (stock > 50) {
    badgeClass = "bg-green-100 text-green-800 border-green-200"
    label = "In Stock"
  } else if (stock > 10) {
    badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200"
    label = "Low Stock"
  } else {
    badgeClass = "bg-red-100 text-red-800 border-red-200"
    label = "Critical"
  }

  return (
    <Badge variant="outline" className={`${badgeClass} rounded-md border px-2 py-0.5 text-xs font-medium`}>
      {label} ({stock})
    </Badge>
  )
}
