"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Star, MapPin, Calendar, ShoppingCart, Badge, Phone, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { type Vendor } from "@/lib/mock-vendor-data"

interface VendorProfileModalProps {
  vendor: Vendor | null
  isOpen: boolean
  onClose: () => void
}

export function VendorProfileModal({ vendor, isOpen, onClose }: VendorProfileModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  if (!vendor) return null

  const formatPrice = (price: number) => {
    return `Le ${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const farmerTypeLabels = {
    organic: "Organic Farmer",
    fish: "Fish Farmer",
    poultry: "Poultry Farmer",
    livestock: "Livestock Farmer",
    mixed: "Mixed Farming"
  } as const

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-[#227C4F] to-[#2D8F5A] relative">
              {vendor.image && (
                <Image
                  src={vendor.image}
                  alt={vendor.name}
                  fill
                  className="object-cover opacity-20"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-[#227C4F] to-[#2D8F5A] opacity-90" />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
                  {vendor.image ? (
                    <Image
                      src={vendor.image}
                      alt={vendor.name}
                      width={128}
                      height={128}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#227C4F] flex items-center justify-center text-white text-2xl font-bold">
                      {vendor.name.charAt(0)}
                    </div>
                  )}
                </div>
                {vendor.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-[#F5C451] rounded-full p-2">
                    <Badge className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 px-6 pb-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
                  {vendor.verified && (
                    <UIBadge className="bg-[#F5C451] text-white">
                      Verified
                    </UIBadge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{vendor.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(vendor.joinDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{vendor.rating}</span>
                    <span className="text-gray-600">({vendor.reviewCount} reviews)</span>
                  </div>
                  <UIBadge variant="outline">
                    {farmerTypeLabels[vendor.farmerType as keyof typeof farmerTypeLabels] || vendor.farmerType}
                  </UIBadge>
                </div>

                <p className="text-gray-700 max-w-2xl">{vendor.description}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Contact
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Content Tabs */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="products" className="h-full flex flex-col">
              <TabsList className="mx-6 mt-4">
                <TabsTrigger value="products">Products ({vendor.products.length})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="flex-1 overflow-auto px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {vendor.products.map((product) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="relative h-32 mb-3 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                          {!product.inStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">Out of Stock</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-[#227C4F]">{formatPrice(product.price)}</p>
                              <p className="text-xs text-gray-500">{product.unit}</p>
                            </div>
                            <UIBadge variant="secondary" className="text-xs">
                              {product.category}
                            </UIBadge>
                          </div>

                          {product.quantity && (
                            <p className="text-xs text-gray-500">
                              {product.quantity} available
                            </p>
                          )}

                          <Button 
                            size="sm" 
                            className="w-full bg-[#227C4F] hover:bg-[#227C4F]/90"
                            disabled={!product.inStock}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {product.inStock ? "Add to Cart" : "Out of Stock"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {vendor.products.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No products available at the moment.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="flex-1 overflow-auto px-6 pb-6">
                <div className="mt-4 space-y-4">
                  {/* Mock Reviews */}
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">Customer {i}</h4>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className="h-3 w-3 fill-yellow-400 text-yellow-400" 
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              Excellent quality products and fast delivery. Highly recommended!
                            </p>
                            <p className="text-xs text-gray-400 mt-1">2 weeks ago</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="flex-1 overflow-auto px-6 pb-6">
                <div className="mt-4 space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Farm Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Farm Type</h4>
                        <p className="text-gray-600">{farmerTypeLabels[vendor.farmerType as keyof typeof farmerTypeLabels] || vendor.farmerType}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Location</h4>
                        <p className="text-gray-600">{vendor.location}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Member Since</h4>
                        <p className="text-gray-600">{formatDate(vendor.joinDate)}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Products</h4>
                        <p className="text-gray-600">{vendor.products.length} items available</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">About the Farm</h3>
                    <p className="text-gray-700 leading-relaxed">{vendor.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Quality Commitment</h3>
                    <div className="bg-[#F7FAF9] p-4 rounded-lg">
                      <p className="text-gray-700">
                        {vendor.verified ? (
                          "This is a verified vendor. We've confirmed their identity and farm location to ensure quality and reliability."
                        ) : (
                          "This vendor is currently pending verification. We're working to verify their farm details."
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
