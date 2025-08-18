import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  MapPin,
  Star,
  CheckCircle,
  Phone,
  Mail,
  ExternalLink,
  MessageSquare,
  Calendar,
  ShoppingBag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for vendors
const mockVendors = {
  v1: {
    id: "v1",
    name: "Kamara Family Farm",
    profileImage: "/sierra-leone-farm.png",
    coverImage: "/sierra-leone-farmer-market.png",
    location: "Bo District, Sierra Leone",
    verified: true,
    rating: 4.8,
    reviewCount: 124,
    farmerType: "organic",
    description:
      "The Kamara Family Farm is a third-generation organic farm located in the fertile lands of Bo District. We specialize in growing cassava, plantains, sweet potatoes, and various vegetables using traditional farming methods combined with modern sustainable practices. Our farm is committed to providing the freshest, highest-quality produce while preserving the environment and supporting our local community.",
    joinedDate: "March 2021",
    phone: "+232 76 123456",
    email: "kamara.farm@example.com",
    website: "kamarafarm.sl",
    productCount: 24,
    orderCount: 1240,
    certifications: ["Organic Certified", "Fair Trade", "Sustainable Farming"],
    farmingPractices: [
      "No chemical pesticides or fertilizers",
      "Water conservation techniques",
      "Crop rotation to maintain soil health",
      "Solar-powered irrigation systems",
    ],
    gallery: ["/sierra-leone-farm.png", "/sierra-leone-farm-produce.png", "/fresh-cassava.png", "/plantains-bunch.png"],
    popularProducts: [
      {
        id: "p1",
        name: "Organic Cassava",
        image: "/fresh-cassava.png",
        price: 25000,
        unit: "5kg bag",
      },
      {
        id: "p2",
        name: "Fresh Plantains",
        image: "/plantains-bunch.png",
        price: 15000,
        unit: "bunch",
      },
      {
        id: "p3",
        name: "Sweet Potatoes",
        image: "/roasted-sweet-potatoes.png",
        price: 20000,
        unit: "3kg bag",
      },
    ],
  },
  v2: {
    id: "v2",
    name: "Koroma Fish Farm",
    profileImage: "/diverse-farm-produce.png",
    coverImage: "/sierra-leone-farm-produce.png",
    location: "Freetown, Sierra Leone",
    verified: true,
    rating: 4.6,
    reviewCount: 87,
    farmerType: "fish",
    description:
      "Koroma Fish Farm is a family-owned sustainable fish farming operation located near Freetown. We specialize in tilapia and catfish, raised in clean water systems without antibiotics or harmful chemicals. Our mission is to provide fresh, healthy fish to local communities while promoting sustainable aquaculture practices in Sierra Leone.",
    joinedDate: "June 2022",
    phone: "+232 77 987654",
    email: "koroma.fish@example.com",
    website: "koromafish.sl",
    productCount: 12,
    orderCount: 760,
    certifications: ["Sustainable Aquaculture", "Quality Assured"],
    farmingPractices: [
      "Recirculating aquaculture systems",
      "Organic fish feed",
      "Regular water quality monitoring",
      "Sustainable waste management",
    ],
    gallery: [
      "/diverse-farm-produce.png",
      "/sierra-leone-farm-produce.png",
      "/fresh-cassava.png",
      "/plantains-bunch.png",
    ],
    popularProducts: [
      {
        id: "p4",
        name: "Fresh Tilapia",
        image: "/diverse-farm-produce.png",
        price: 35000,
        unit: "kg",
      },
      {
        id: "p5",
        name: "Catfish Fillets",
        image: "/sierra-leone-farm-produce.png",
        price: 45000,
        unit: "kg",
      },
      {
        id: "p6",
        name: "Smoked Fish",
        image: "/fresh-cassava.png",
        price: 30000,
        unit: "500g pack",
      },
    ],
  },
}

export const generateMetadata = ({ params }: { params: { vendorId: string } }): Metadata => {
  const vendor = mockVendors[params.vendorId]
  if (!vendor) {
    return {
      title: "Vendor Not Found | FarmTrust Sierra Leone",
      description: "The requested vendor could not be found",
    }
  }

  return {
    title: `${vendor.name} | FarmTrust Sierra Leone`,
    description: `Shop fresh produce directly from ${vendor.name}, a verified farmer in ${vendor.location}`,
  }
}

export default function VendorProfilePage({ params }: { params: { vendorId: string } }) {
  // Get the vendor data based on the ID
  const vendor = mockVendors[params.vendorId]

  // If vendor not found, show 404
  if (!vendor) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Cover Image */}
      <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-6">
        <Image
          src={vendor.coverImage || "/placeholder.svg"}
          alt={`${vendor.name} farm`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white">
          <div className="flex items-center">
            {vendor.verified && (
              <Badge className="bg-[#227C4F] mr-2 font-normal">
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Verified Farmer
              </Badge>
            )}
            <Badge className="bg-[#F5C451] text-gray-900 font-normal">
              {vendor.farmerType.charAt(0).toUpperCase() + vendor.farmerType.slice(1)} Farmer
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-80">
          <div className="bg-white rounded-xl border p-5 sticky top-6">
            <div className="flex flex-col items-center mb-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-3">
                <Image
                  src={vendor.profileImage || "/placeholder.svg"}
                  alt={vendor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h1 className="text-xl font-bold text-center">{vendor.name}</h1>
              <div className="flex items-center mt-1 mb-2">
                <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-500">{vendor.location}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="ml-1 font-medium">{vendor.rating}</span>
                <span className="text-sm text-gray-500 ml-1">({vendor.reviewCount} reviews)</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-sm">{vendor.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-sm">{vendor.email}</span>
              </div>
              {vendor.website && (
                <div className="flex items-center">
                  <ExternalLink className="h-4 w-4 text-gray-500 mr-3" />
                  <a
                    href={`https://${vendor.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#227C4F] hover:underline"
                  >
                    {vendor.website}
                  </a>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-sm">Joined {vendor.joinedDate}</span>
              </div>
              <div className="flex items-center">
                <ShoppingBag className="h-4 w-4 text-gray-500 mr-3" />
                <span className="text-sm">{vendor.orderCount}+ orders completed</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
              <Button className="w-full bg-[#227C4F] hover:bg-[#1b6a43]">Shop All Products</Button>
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Farmer
              </Button>
            </div>

            <Separator className="my-4" />

            <div>
              <h3 className="font-medium mb-2">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {vendor.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="font-normal">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-0">
              <div className="bg-white rounded-xl border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">About {vendor.name}</h2>
                <p className="text-gray-700 mb-6">{vendor.description}</p>

                <h3 className="font-semibold text-lg mb-3">Farming Practices</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-6">
                  {vendor.farmingPractices.map((practice, index) => (
                    <li key={index}>{practice}</li>
                  ))}
                </ul>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Products</h4>
                        <span className="text-2xl font-bold text-[#227C4F]">{vendor.productCount}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Orders Completed</h4>
                        <span className="text-2xl font-bold text-[#227C4F]">{vendor.orderCount}+</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Popular Products</h2>
                  <Link href={`/products?vendor=${vendor.id}`} className="text-[#227C4F] text-sm hover:underline">
                    View all products
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {vendor.popularProducts.map((product) => (
                    <Link href={`/products/${product.id}`} key={product.id}>
                      <Card className="overflow-hidden hover:border-[#227C4F]/50 transition-all duration-200">
                        <div className="relative h-40">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-[#227C4F] font-semibold mt-1">
                            Le {product.price.toLocaleString()} / {product.unit}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">All Products</h2>
                  <div className="flex items-center gap-2">
                    <select className="text-sm border rounded-md px-3 py-1.5">
                      <option>Sort by: Recommended</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest First</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[...vendor.popularProducts, ...vendor.popularProducts, ...vendor.popularProducts].map(
                    (product, index) => (
                      <Link href={`/products/${product.id}`} key={`${product.id}-${index}`}>
                        <Card className="overflow-hidden hover:border-[#227C4F]/50 transition-all duration-200">
                          <div className="relative h-40">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-[#227C4F] font-semibold mt-1">
                              Le {product.price.toLocaleString()} / {product.unit}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ),
                  )}
                </div>

                <div className="flex justify-center mt-6">
                  <Button variant="outline">Load More Products</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="mt-0">
              <div className="bg-white rounded-xl border p-6">
                <h2 className="text-xl font-semibold mb-6">Farm Gallery</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {vendor.gallery.map((image, index) => (
                    <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${vendor.name} farm gallery image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              <div className="bg-white rounded-xl border p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">Customer Reviews</h2>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${star <= Math.floor(vendor.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-medium">{vendor.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({vendor.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <Button>Write a Review</Button>
                </div>

                <div className="space-y-6">
                  {/* Review 1 */}
                  <div className="border-b pb-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-3">
                          JK
                        </div>
                        <div>
                          <h4 className="font-medium">John Koroma</h4>
                          <div className="flex items-center">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${star <= 5 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">2 weeks ago</span>
                    </div>
                    <p className="text-gray-700">
                      The cassava from Kamara Family Farm is the best I've ever had. It's always fresh and tastes
                      amazing. The delivery was prompt and the packaging was excellent. Will definitely order again!
                    </p>
                  </div>

                  {/* Review 2 */}
                  <div className="border-b pb-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-3">
                          MB
                        </div>
                        <div>
                          <h4 className="font-medium">Mariama Bangura</h4>
                          <div className="flex items-center">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">1 month ago</span>
                    </div>
                    <p className="text-gray-700">
                      I've been buying plantains from this farm for months now. They're always of high quality and ripen
                      perfectly. The farmer is very friendly and responsive to messages. Highly recommend!
                    </p>
                  </div>

                  {/* Review 3 */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium mr-3">
                          AS
                        </div>
                        <div>
                          <h4 className="font-medium">Abdul Sesay</h4>
                          <div className="flex items-center">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${star <= 5 ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">2 months ago</span>
                    </div>
                    <p className="text-gray-700">
                      The sweet potatoes from Kamara Family Farm are exceptional. You can really taste the difference
                      with organic farming. I appreciate their commitment to sustainable practices and supporting the
                      local community.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <Button variant="outline">Load More Reviews</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
