import Image from "next/image"
import Link from "next/link"
import { CheckCircle, MapPin, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { mockVendors, type Vendor } from "@/lib/mock-vendor-data"


// Filter vendors based on all filter parameters
interface FilterParams {
  filter?: string
  searchQuery?: string
  location?: string
  farmerTypes?: string[]
  rating?: string
  verifiedOnly?: boolean
  sortBy?: string
  onVendorClick?: (vendor: Vendor) => void
}

const filterAndSortVendors = ({
  filter,
  searchQuery = "",
  location = "all",
  farmerTypes = [],
  rating = "any",
  verifiedOnly = false,
  sortBy = "recommended"
}: FilterParams) => {
  let filteredVendors = [...mockVendors]

  // Apply preset filter (featured, new, popular)
  if (filter && filter !== "all") {
    if (filter === "featured") {
      filteredVendors = filteredVendors.filter((vendor) => vendor.rating >= 4.7)
    } else if (filter === "new") {
      // In a real app, this would filter based on join date
      filteredVendors = filteredVendors.slice(1, 5)
    } else if (filter === "popular") {
      filteredVendors = filteredVendors.filter((vendor) => vendor.reviewCount > 90)
    }
  }

  // Apply search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredVendors = filteredVendors.filter((vendor) =>
      vendor.name.toLowerCase().includes(query) ||
      vendor.description.toLowerCase().includes(query) ||
      vendor.location.toLowerCase().includes(query)
    )
  }

  // Apply location filter
  if (location !== "all") {
    filteredVendors = filteredVendors.filter((vendor) => {
      if (location === "bo") return vendor.location.toLowerCase().includes("bo")
      if (location === "freetown") return vendor.location.toLowerCase().includes("freetown")
      if (location === "kenema") return vendor.location.toLowerCase().includes("kenema")
      if (location === "makeni") return vendor.location.toLowerCase().includes("makeni")
      if (location === "koidu") return vendor.location.toLowerCase().includes("koidu")
      return true
    })
  }

  // Apply farmer type filter
  if (farmerTypes.length > 0) {
    filteredVendors = filteredVendors.filter((vendor) =>
      farmerTypes.includes(vendor.farmerType)
    )
  }

  // Apply rating filter
  if (rating !== "any") {
    const minRating = rating === "4plus" ? 4 : rating === "3plus" ? 3 : 2
    filteredVendors = filteredVendors.filter((vendor) => vendor.rating >= minRating)
  }

  // Apply verification filter
  if (verifiedOnly) {
    filteredVendors = filteredVendors.filter((vendor) => vendor.verified)
  }

  // Apply sorting
  filteredVendors.sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "newest":
        // In a real app, this would sort by join date
        return b.reviewCount - a.reviewCount
      case "oldest":
        // In a real app, this would sort by join date (reverse)
        return a.reviewCount - b.reviewCount
      default: // "recommended"
        // Sort by a combination of rating and review count
        return (b.rating * b.reviewCount) - (a.rating * a.reviewCount)
    }
  })

  return filteredVendors
}

export default function VendorsList({ 
  filter,
  searchQuery,
  location,
  farmerTypes,
  rating,
  verifiedOnly,
  sortBy,
  onVendorClick
}: FilterParams) {
  const vendors = filterAndSortVendors({
    filter,
    searchQuery,
    location,
    farmerTypes,
    rating,
    verifiedOnly,
    sortBy
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vendors.map((vendor) => (
        <Card key={vendor.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="relative h-48">
            <Image src={vendor.image || "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&h=200&fit=crop&q=80"} alt={vendor.name} fill className="object-cover" />
            {vendor.verified && (
              <Badge className="absolute top-2 right-2 bg-[#227C4F]">
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Verified
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{vendor.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {vendor.location}
                </div>
              </div>
              <Badge
                className={`${
                  vendor.farmerType === "organic"
                    ? "bg-[#227C4F]/10 text-[#227C4F]"
                    : vendor.farmerType === "fish"
                      ? "bg-[#438DBB]/10 text-[#438DBB]"
                      : "bg-[#F5C451]/10 text-[#F5C451]"
                }`}
              >
                {vendor.farmerType.charAt(0).toUpperCase() + vendor.farmerType.slice(1)}
              </Badge>
            </div>

            <div className="flex items-center mt-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="ml-1 font-medium">{vendor.rating}</span>
              <span className="text-sm text-gray-500 ml-1">({vendor.reviewCount} reviews)</span>
            </div>

            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{vendor.description}</p>

            <div className="text-sm text-gray-500 mt-3">{vendor.products.length} products available</div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2">
            {onVendorClick ? (
              <Button 
                className="flex-1 bg-[#227C4F] hover:bg-[#1b6a43]"
                onClick={() => onVendorClick(vendor)}
              >
                View Profile
              </Button>
            ) : (
              <Button asChild className="flex-1 bg-[#227C4F] hover:bg-[#1b6a43]">
                <Link href={`/vendors/${vendor.id}`}>View Profile</Link>
              </Button>
            )}
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/products?vendor=${vendor.id}`}>Shop Products</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
