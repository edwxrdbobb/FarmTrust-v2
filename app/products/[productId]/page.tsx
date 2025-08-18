"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Leaf, MapPin, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductImageGallery } from "@/components/buyer/product-image-gallery"
import { ProductQuantitySelector } from "@/components/buyer/product-quantity-selector"
import { ProductReviews } from "@/components/buyer/product-reviews"
import { RelatedProducts } from "@/components/buyer/related-products"
import { ProductSkeleton } from "./loading"
import { useCartContext } from "@/context/CartContext"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Fetch real product data from API
const getProductData = async (id: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products/${id}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    // Return fallback data if API fails - use realistic demo data
    return {
      id,
      name: "Fresh Organic Cassava",
      description: "Premium quality cassava grown using sustainable farming practices in Bo District.",
      longDescription: "Our premium cassava is grown in the fertile soils of Bo District using traditional organic farming methods. Hand-harvested at peak ripeness and carefully selected for quality, this cassava is perfect for cooking and processing.",
      price: 25000,
      unit: "5kg bag",
      quantity: 50,
      category: "Vegetables",
      organic: true,
      featured: true,
      available: true,
      images: ["/fresh-cassava.png", "/sierra-leone-farm-produce.png"],
      vendor: {
        id: "v1",
        farmName: "Kamara Family Farm",
        location: "Bo District, Sierra Leone",
        rating: 4.8,
        verified: true,
        totalSales: 1240,
      },
      nutritionalInfo: {
        calories: "160 per 100g",
        carbs: "38g per 100g",
        protein: "1.4g per 100g",
        fat: "0.3g per 100g",
        fiber: "1.8g per 100g",
      },
      specifications: {
        origin: "Bo District, Sierra Leone",
        cultivation: "Organic, Pesticide-free",
        harvest: "Fresh, within 24 hours",
        storage: "Cool, dry place",
      },
    };
  }
}

// Mock related products
const relatedProducts = [
  {
    id: "p2",
    name: "Sweet Potatoes",
    price: 18000,
    unit: "kg",
    image: "/roasted-sweet-potatoes.png",
    vendor: "Bo District Organic Farm",
    badge: "Organic",
  },
  {
    id: "p3",
    name: "Plantains",
    price: 15000,
    unit: "bunch",
    image: "/plantains-bunch.png",
    vendor: "Makeni Family Farms",
  },
  {
    id: "p4",
    name: "Palm Oil",
    price: 45000,
    unit: "liter",
    image: "/placeholder-80ur8.png",
    vendor: "Kenema Oil Collective",
    badge: "Featured",
  },
]

export default function ProductDetailsPage({ params }: { params: { productId: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addItem } = useCartContext()
  const router = useRouter()

  // Fetch product data on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductData(params.productId)
        setProduct(productData)
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.productId])

  const handleAddToCart = async () => {
    if (!product || product.quantity === 0) return
    
    setIsAddingToCart(true)
    
    try {
      const vendorName = product.vendor?.farmName || "Unknown Vendor"
      
      const cartItem = {
        id: `${product.id}_default`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg",
        unit: product.unit,
        vendor: vendorName,
      }
      
      await addItem(cartItem)
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      console.error("Failed to add item to cart:", error)
      toast({
        title: "Failed to add to cart",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product || product.quantity === 0) return
    
    // First add the product to cart
    await handleAddToCart()
    
    // Then navigate to checkout
    router.push('/checkout')
  }

  const handleViewProfile = () => {
    if (product?.vendor?.id) {
      // Navigate to vendor profile page with vendor ID
      // For now, we'll use a fallback vendor ID since the API might not return it
      const vendorId = product.vendor.id !== 'unknown' ? product.vendor.id : 'v1'
      router.push(`/vendors/${vendorId}`)
    } else {
      // Fallback to a default vendor profile
      router.push('/vendors/v1')
    }
  }

  if (loading) {
    return <ProductSkeleton />
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F7FAF9] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/products">
            <Button className="bg-[#227C4F] hover:bg-[#1b6a43] text-white">
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7FAF9]">
      <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link href="/products" className="text-sm text-gray-600 hover:text-[#227C4F] flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="sticky top-24">
            <Suspense fallback={<ProductSkeleton />}>
              <ProductImageGallery images={product.images} alt={product.name} />
            </Suspense>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[#F5C451] text-gray-800">{product.category}</Badge>
                {product.organic && (
                  <Badge className="bg-[#227C4F] text-white flex items-center gap-1">
                    <Leaf className="h-3 w-3" />
                    Organic
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{product.name}</h1>

              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-[#F5C451] fill-[#F5C451]" />
                  <span className="ml-1 text-sm font-medium">{product.vendor.rating}</span>
                  <span className="ml-1 text-sm text-gray-500">(24 reviews)</span>
                </div>

                {product.vendor.verified && (
                  <div className="flex items-center text-[#227C4F]">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="ml-1 text-sm font-medium">Verified Farmer</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{product.vendor.location}</span>
            </div>

            <div className="text-2xl font-bold text-gray-800">
              Le {product.price.toLocaleString()}/{product.unit}
            </div>

            <p className="text-gray-600">{product.description}</p>

            {/* Sold by section */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Sold by:</span>
              <button 
                onClick={handleViewProfile}
                className="font-medium text-[#227C4F] hover:text-[#1b6a43] hover:underline cursor-pointer"
              >
                {product.vendor.farmName}
              </button>
              {product.vendor.verified && (
                <div className="flex items-center text-[#227C4F]">
                  <ShieldCheck className="h-3 w-3 ml-1" />
                  <span className="text-xs ml-0.5">Verified</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="h-4 w-4" />
              <span>Delivery available to Freetown and surrounding areas</span>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Quantity</h3>
              <ProductQuantitySelector
                maxQuantity={product.quantity}
                unit={product.unit}
                available={product.available}
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                
           
                <Button 
                  size="sm" 
                  className="rounded-xl bg-[#227C4F] hover:bg-[#1b6a43] text-white"
                  disabled={product.quantity === 0 || isAddingToCart}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>

                <Button
                  variant="outline"
                  className="border-[#227C4F] text-[#227C4F] hover:bg-[#227C4F]/10 rounded-xl px-6 py-2 flex-1"
                  disabled={product.quantity === 0 || isAddingToCart}
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>
            </div>

            <Separator />

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-[#F7FAF9] rounded-full flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=48&width=48&query=farm+logo"
                    alt="Farm logo"
                    className="h-8 w-8 rounded-full"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{product.vendor.farmName}</h3>
                  <p className="text-sm text-gray-600">{product.vendor.totalSales.toLocaleString()} products sold</p>
                </div>
                <Button
                  variant="outline"
                  className="ml-auto text-[#227C4F] border-[#227C4F] hover:bg-[#227C4F]/10 rounded-xl"
                  onClick={handleViewProfile}
                >
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="details">
            <TabsList className="bg-white border-b border-gray-200 w-full justify-start rounded-none h-auto p-0">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#227C4F] data-[state=active]:text-[#227C4F] py-3 px-4"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="nutrition"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#227C4F] data-[state=active]:text-[#227C4F] py-3 px-4"
              >
                Nutrition
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#227C4F] data-[state=active]:text-[#227C4F] py-3 px-4"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{product.longDescription}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                  <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <dl className="space-y-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-2">
                          <dt className="text-gray-600 capitalize">{key}</dt>
                          <dd className="text-gray-900 font-medium">{value as string}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nutrition" className="pt-6">
              <div className="max-w-2xl">
                <h3 className="text-xl font-semibold mb-4">Nutritional Information</h3>
                <p className="text-gray-700 mb-4">Approximate values per 100g of raw cassava:</p>

                <div className="bg-white rounded-xl p-6 border border-gray-100">
                  <dl className="space-y-4">
                    {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <dt className="text-gray-600 capitalize">{key}</dt>
                        <dd className="text-gray-900 font-medium">{value as string}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="pt-6">
              <ProductReviews productId={product.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <RelatedProducts products={relatedProducts} />
        </div>
      </div>
    </main>
  )
}
