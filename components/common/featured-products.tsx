"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, ArrowRight, Loader2, Star, ShoppingCart } from "lucide-react"
import { useBuyerProducts } from "@/hooks/useProducts"
import { useEffect } from "react"
import { SampleFeaturedProducts } from "./sample-products"

export function FeaturedProducts() {
  const { products, loading, error, fetchProducts } = useBuyerProducts()

  // Fetch featured products
  useEffect(() => {
    fetchProducts(1, 6, { featured: true }) // Show up to 6 products on landing page
  }, [])

  // Helper function to format price
  const formatPrice = (price: number) => {
    return `Le ${price.toLocaleString()}`
  }

  // Helper function to get vendor name
  const getVendorName = (product: any) => {
    if (product.vendor?.business_name) {
      return product.vendor.business_name
    }
    if (product.vendor?.first_name && product.vendor?.last_name) {
      return `${product.vendor.first_name} ${product.vendor.last_name}`
    }
    return product.location || "Local Farm"
  }

  // Helper function to get product image
  const getProductImage = (product: any) => {
    if (product.images && product.images.length > 0) {
      return product.images[0]
    }
    return "/placeholder.svg?height=400&width=600&query=farm+produce"
  }

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              Fresh from Our Farmers
            </Badge>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">Featured Products</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Handpicked selection of the finest produce from Sierra Leone's most trusted farmers.
            </p>
          </div>

          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading featured products...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              Fresh from Our Farmers
            </Badge>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">Featured Products</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Handpicked selection of the finest produce from Sierra Leone's most trusted farmers.
            </p>
          </div>

          <div className="text-center py-16">
            <p className="text-red-500 mb-4">Unable to load products at the moment</p>
            <Button onClick={() => fetchProducts(1, 6, { featured: true })} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2">
            <Globe className="w-4 h-4 mr-2" />
            Fresh from Our Farmers
          </Badge>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6">Featured Products</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Handpicked selection of the finest produce from Sierra Leone's most trusted farmers.
          </p>
          <Link href="/products" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold group">
            Explore All Products
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="-mt-20">
            <SampleFeaturedProducts />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {products.slice(0, 6).map((product, index) => (
              <div 
                key={product._id} 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-48 overflow-hidden relative group">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.organic && (
                    <Badge className="absolute top-3 left-3 bg-green-500 text-white border-0">
                      Organic
                    </Badge>
                  )}
                  {product.featured && (
                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-white border-0">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center ml-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm text-gray-500">4.8</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                    {getVendorName(product)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-xs text-gray-500">per {product.unit}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl group">
                        <ShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        Add to Cart
                      </Button>
                      <span className="text-xs text-gray-500 mt-1">
                        {product.stock} {product.unit} available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl px-8 py-3 font-semibold">
                View All Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
