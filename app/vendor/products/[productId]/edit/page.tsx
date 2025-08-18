"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"

import { VendorSidebar } from "@/components/vendor/vendor-sidebar"
import { ProductForm } from "@/components/vendor/vendor-product-form"

export default function EditProductPage() {
  const params = useParams()
  const productId = params.productId as string
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', productId)
        const response = await fetch(`/api/products/${productId}`, {
          credentials: 'include', // Include cookies for authentication
        })
        
        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))
        
        if (!response.ok) {
          const errorData = await response.text()
          console.error('Error response:', errorData)
          
          if (response.status === 404) {
            console.error('Product not found - 404 error')
            notFound()
            return
          }
          
          throw new Error(`HTTP ${response.status}: ${errorData || 'Failed to fetch product'}`)
        }
        
        const data = await response.json()
        console.log('Product data received:', data)
        setProduct(data.product)
      } catch (err: any) {
        console.error('Fetch product error:', err)
        setError(err.message || 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  if (loading) {
    return (
      <VendorSidebar>
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading product...</div>
          </div>
        </div>
      </VendorSidebar>
    )
  }

  if (error) {
    return (
      <VendorSidebar>
        <div className="container mx-auto p-4 md:p-6">
          <div className="text-center text-red-600">
            <h1 className="text-xl font-semibold">Error</h1>
            <p>{error}</p>
          </div>
        </div>
      </VendorSidebar>
    )
  }

  if (!product) {
    notFound()
  }

  return (
    <VendorSidebar>
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
          <p className="text-gray-600 mt-1">Update your product details and inventory</p>
        </div>

        <ProductForm initialData={product} isEditing={true} productId={productId} />
      </div>
    </VendorSidebar>
  )
}
