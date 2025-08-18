"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, ChevronRight, Leaf, MapPin, Star, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

// Types for real data
type Product = {
  _id: string
  name: string
  price: number
  unit: string
  images: string[]
  vendor: {
    farmName: string
    location: string
  }
  organic: boolean
}

type Category = {
  _id: string
  name: string
  productCount: number
  image?: string
}

type Vendor = {
  _id: string
  farmName: string
  location: string
  image?: string
  verified: boolean
  rating: number
  totalReviews: number
  productCount: number
}

export default function HomePage() {
  const [seasonalProducts, setSeasonalProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      
      // Fetch featured products
      const productsResponse = await fetch('/api/products?featured=true&limit=4')
      const productsData = await productsResponse.json()
      setSeasonalProducts(productsData.products || [])

      // Fetch categories
      const categoriesResponse = await fetch('/api/categories')
      const categoriesData = await categoriesResponse.json()
      setCategories(categoriesData.categories || [])

      // Fetch top vendors
      const vendorsResponse = await fetch('/api/vendor?limit=3&sortBy=rating')
      const vendorsData = await vendorsResponse.json()
      setVendors(vendorsData.vendors || [])
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  const recentlyViewed = [
    {
      id: 1,
      name: "Fresh Cassava",
      price: "Le 75,000",
      image: "/fresh-cassava.png",
      farm: "Bo City Farm",
    },
    {
      id: 2,
      name: "Sweet Potatoes",
      price: "Le 60,000",
      image: "/roasted-sweet-potatoes.png",
      farm: "Makeni Farms",
    },
    {
      id: 3,
      name: "Plantains",
      price: "Le 45,000",
      image: "/plantains-bunch.png",
      farm: "Kenema Growers",
    },
    {
      id: 4,
      name: "Palm Oil",
      price: "Le 120,000",
      image: "/sierra-leone-farm-produce.png",
      farm: "Freetown Organics",
    },
  ]

  return (
    <div className="min-h-screen bg-[#F7FAF9]">
      {/* Hero Banner */}
      <section className="relative bg-[#227C4F] text-white">
        <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back, Aminata!</h1>
            <p className="text-lg opacity-90 mb-6">Discover fresh, local produce from Sierra Leone's best farmers</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-white text-[#227C4F] hover:bg-gray-100">Browse Products</Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Find Local Farmers
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <img
              src="/sierra-leone-farm.png"
              alt="Sierra Leone Farm"
              className="rounded-lg shadow-lg w-full h-auto md:max-w-md mx-auto"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Seasonal Products */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Seasonal Favorites</h2>
              <p className="text-gray-500">Fresh produce in season now</p>
            </div>
            <Button variant="link" className="text-[#227C4F] flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              {seasonalProducts.map((product) => (
                <CarouselItem key={product._id} className="md:basis-1/2 lg:basis-1/3">
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:flex">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </section>

        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="vegetables">Vegetables</TabsTrigger>
              <TabsTrigger value="fruits">Fruits</TabsTrigger>
              <TabsTrigger value="grains">Grains</TabsTrigger>
              <TabsTrigger value="spices">Spices</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </TabsContent>

            <TabsContent value="vegetables">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories
                  .filter((cat) => cat.name === "Vegetables")
                  .map((category) => (
                    <CategoryCard key={category._id} category={category} />
                  ))}
              </div>
            </TabsContent>

            {/* Other category tabs would be similar */}
            <TabsContent value="fruits">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories
                  .filter((cat) => cat.name === "Fruits")
                  .map((category) => (
                    <CategoryCard key={category._id} category={category} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Featured Farmers */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Featured Farmers</h2>
              <p className="text-gray-500">Local farmers in your region</p>
            </div>
            <Button variant="link" className="text-[#227C4F] flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <FarmerCard key={vendor._id} farmer={vendor} />
            ))}
          </div>
        </section>

        {/* Special Offers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Special Offers</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden border-none shadow-md">
              <div className="relative h-48 bg-[#F5C451]">
                <div className="absolute inset-0 flex flex-col justify-center p-6">
                  <Badge className="w-fit mb-2 bg-white text-[#227C4F]">Limited Time</Badge>
                  <h3 className="text-xl font-bold text-white mb-2">Bulk Purchase Discount</h3>
                  <p className="text-white mb-4">Save 15% when you buy 5 or more bags of the same product</p>
                  <Button className="w-fit bg-white text-[#227C4F] hover:bg-gray-100">Shop Now</Button>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-none shadow-md">
              <div className="relative h-48 bg-[#438DBB]">
                <div className="absolute inset-0 flex flex-col justify-center p-6">
                  <Badge className="w-fit mb-2 bg-white text-[#438DBB]">New Farmers</Badge>
                  <h3 className="text-xl font-bold text-white mb-2">Support Local Growers</h3>
                  <p className="text-white mb-4">Free delivery on your first order from new farmers</p>
                  <Button className="w-fit bg-white text-[#438DBB] hover:bg-gray-100">Discover</Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Recently Viewed */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recently Viewed</h2>
            <Button variant="link" className="text-[#227C4F]">
              Clear History
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyViewed.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border">
                <div className="h-24 overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{product.farm}</p>
                  <p className="text-sm font-medium mt-1">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden border-none shadow-sm">
      <div className="relative">
        <img src={product.images[0] || "/placeholder.svg"} alt={product.name} className="w-full h-48 object-cover" />
        {product.organic && (
          <Badge className="absolute top-2 right-2 bg-[#227C4F]">
            <Leaf className="h-3 w-3 mr-1" /> Organic
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.vendor.farmName}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Le {product.price.toLocaleString()}</p>
            <p className="text-xs text-gray-500">per {product.unit}</p>
          </div>
        </div>
        <div className="flex items-center mt-2 text-sm">
          <MapPin className="h-3 w-3 text-gray-400 mr-1" />
          <span className="text-gray-500">{product.vendor.location}</span>
        </div>
        <Button className="w-full mt-3 bg-[#227C4F] hover:bg-[#1b6a43]">Add to Cart</Button>
      </CardContent>
    </Card>
  )
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="relative rounded-xl overflow-hidden h-32 group">
      <img
        src={category.image || "/placeholder.svg"}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-white font-semibold">{category.name}</h3>
          <span className="text-xs text-white opacity-80">{category.productCount} items</span>
        </div>
      </div>
    </div>
  )
}

function FarmerCard({ farmer }: { farmer: Vendor }) {
  return (
    <Card className="overflow-hidden border-none shadow-sm">
      <div className="p-4 flex items-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
          <img src={farmer.image || "/placeholder.svg"} alt={farmer.farmName} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="flex items-center">
            <h3 className="font-semibold">{farmer.farmName}</h3>
            {farmer.verified && <Badge className="ml-2 bg-[#227C4F] text-xs">Verified</Badge>}
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
            <span className="text-gray-500">{farmer.location}</span>
          </div>
          <div className="flex items-center mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < farmer.rating ? "text-[#F5C451] fill-[#F5C451]" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">({farmer.totalReviews})</span>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center text-sm">
          <TrendingUp className="h-3 w-3 text-[#227C4F] mr-1" />
          <span className="text-gray-600">{farmer.productCount} products</span>
        </div>
        <Button variant="link" className="text-[#227C4F] p-0 flex items-center">
          View Profile <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
