"use client"

import { Suspense, useState, useMemo } from "react"
import Link from "next/link"
import { ChevronRight, Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import VendorsList from "@/components/buyer/vendors-list"
import VendorsLoading from "./loading"
import { VendorProfileModal } from "@/components/buyer/vendor-profile-modal"
import { mockVendors, type Vendor } from "@/lib/mock-vendor-data"

export default function VendorsPage() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("all")
  const [farmerTypes, setFarmerTypes] = useState<string[]>([])
  const [rating, setRating] = useState("any")
  const [verifiedOnly, setVerifiedOnly] = useState(true)
  const [sortBy, setSortBy] = useState("recommended")
  
  // Modal state
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Handle vendor click to open modal
  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsModalOpen(true)
  }
  
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedVendor(null)
  }
  
  // Helper function to handle farmer type checkbox changes
  const handleFarmerTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setFarmerTypes(prev => [...prev, type])
    } else {
      setFarmerTypes(prev => prev.filter(t => t !== type))
    }
  }
  
  // Reset filters
  const resetFilters = () => {
    setSearchQuery("")
    setLocation("all")
    setFarmerTypes([])
    setRating("any")
    setVerifiedOnly(true)
    setSortBy("recommended")
  }

  // Calculate filtered vendor count
  const filteredVendorCount = useMemo(() => {
    const mockVendors = [
      {
        id: "v1",
        name: "Kamara Family Farm",
        location: "Bo District",
        verified: true,
        rating: 4.8,
        reviewCount: 124,
        farmerType: "organic",
        description: "Third-generation organic farm specializing in cassava, plantains, and vegetables."
      },
      {
        id: "v2",
        name: "Koroma Fish Farm",
        location: "Freetown",
        verified: true,
        rating: 4.6,
        reviewCount: 87,
        farmerType: "fish",
        description: "Sustainable fish farm raising tilapia and catfish without antibiotics or chemicals."
      },
      {
        id: "v3",
        name: "Bangura Rice Cooperative",
        location: "Makeni",
        verified: true,
        rating: 4.7,
        reviewCount: 92,
        farmerType: "organic",
        description: "Community cooperative growing traditional rice varieties using sustainable methods."
      },
      {
        id: "v4",
        name: "Sesay Poultry Farm",
        location: "Kenema",
        verified: false,
        rating: 4.3,
        reviewCount: 45,
        farmerType: "poultry",
        description: "Family-run poultry farm providing fresh eggs and free-range chickens."
      },
      {
        id: "v5",
        name: "Kargbo Fruit Orchard",
        location: "Bo District",
        verified: true,
        rating: 4.9,
        reviewCount: 156,
        farmerType: "organic",
        description: "Organic fruit orchard growing mangoes, oranges, and other tropical fruits."
      },
      {
        id: "v6",
        name: "Turay Palm Oil Production",
        location: "Bonthe",
        verified: true,
        rating: 4.5,
        reviewCount: 78,
        farmerType: "organic",
        description: "Traditional palm oil production using sustainable harvesting methods."
      },
      {
        id: "v7",
        name: "Freetown Urban Gardens",
        location: "Freetown",
        verified: false,
        rating: 3.9,
        reviewCount: 32,
        farmerType: "organic",
        description: "Urban farming initiative growing fresh vegetables and herbs in the heart of Freetown."
      },
      {
        id: "v8",
        name: "Kailahun Cassava Collective",
        location: "Kailahun",
        verified: true,
        rating: 4.4,
        reviewCount: 67,
        farmerType: "organic",
        description: "Cooperative of smallholder farmers specializing in high-quality cassava production."
      },
      {
        id: "v9",
        name: "Port Loko Fish Traders",
        location: "Port Loko",
        verified: false,
        rating: 4.1,
        reviewCount: 28,
        farmerType: "fish",
        description: "Fresh and smoked fish from the coastal waters, delivered daily to markets."
      },
      {
        id: "v10",
        name: "Moyamba Vegetable Growers",
        location: "Moyamba",
        verified: true,
        rating: 4.6,
        reviewCount: 89,
        farmerType: "organic",
        description: "Sustainable vegetable farming with focus on leafy greens and root vegetables."
      },
      {
        id: "v11",
        name: "Tonkolili Livestock Farm",
        location: "Tonkolili",
        verified: false,
        rating: 3.8,
        reviewCount: 21,
        farmerType: "poultry",
        description: "Mixed livestock farm raising goats, sheep, and chickens for meat and dairy."
      },
      {
        id: "v12",
        name: "Western Area Aquaculture",
        location: "Freetown",
        verified: true,
        rating: 4.7,
        reviewCount: 103,
        farmerType: "fish",
        description: "Modern aquaculture facility producing premium fish using sustainable practices."
      }
    ]

    let filtered = [...mockVendors]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((vendor) =>
        vendor.name.toLowerCase().includes(query) ||
        vendor.description.toLowerCase().includes(query) ||
        vendor.location.toLowerCase().includes(query)
      )
    }

    // Apply location filter
    if (location !== "all") {
      filtered = filtered.filter((vendor) => {
        if (location === "bo") return vendor.location.toLowerCase().includes("bo")
        if (location === "freetown") return vendor.location.toLowerCase().includes("freetown")
        if (location === "kenema") return vendor.location.toLowerCase().includes("kenema")
        if (location === "makeni") return vendor.location.toLowerCase().includes("makeni")
        if (location === "koidu") return vendor.location.toLowerCase().includes("koidu")
        return true
      })
    }

    // Apply farmer types filter
    if (farmerTypes.length > 0) {
      filtered = filtered.filter((vendor) => farmerTypes.includes(vendor.farmerType))
    }

    // Apply rating filter
    if (rating !== "any") {
      const minRating = rating === "4plus" ? 4 : rating === "3plus" ? 3 : 2
      filtered = filtered.filter((vendor) => vendor.rating >= minRating)
    }

    // Apply verification filter
    if (verifiedOnly) {
      filtered = filtered.filter((vendor) => vendor.verified)
    }

    return filtered.length
  }, [searchQuery, location, farmerTypes, rating, verifiedOnly])

  // Check if any filters are active
  const hasActiveFilters = searchQuery || location !== "all" || farmerTypes.length > 0 || rating !== "any" || !verifiedOnly || sortBy !== "recommended"
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Farmers & Vendors</h1>
          <p className="text-gray-500 mt-1">Discover verified farmers and vendors across Sierra Leone</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="search" 
              placeholder="Search vendors..." 
              className="pl-9 w-full md:w-[250px]" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#F7FAF9] p-4 md:p-6 rounded-xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-[#227C4F]/10 p-2 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#227C4F]"
                  >
                    <path d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" />
                    <path d="m9 8 2 2-2 2" />
                    <path d="m13 12-2 2 2 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Verified Farmers</h3>
                  <p className="text-sm text-gray-500">All farmers are verified for quality and reliability</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-[#F5C451]/10 p-2 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#F5C451]"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Direct Sourcing</h3>
                  <p className="text-sm text-gray-500">Buy directly from farmers with no middlemen</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-[#438DBB]/10 p-2 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#438DBB]"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure Transactions</h3>
                  <p className="text-sm text-gray-500">All payments are secure and protected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-medium text-lg mb-4">Filter Vendors</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Location</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="freetown">Freetown</SelectItem>
                    <SelectItem value="bo">Bo</SelectItem>
                    <SelectItem value="kenema">Kenema</SelectItem>
                    <SelectItem value="makeni">Makeni</SelectItem>
                    <SelectItem value="koidu">Koidu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Farmer Type</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="organic" 
                      className="rounded text-[#227C4F] mr-2" 
                      checked={farmerTypes.includes("organic")}
                      onChange={(e) => handleFarmerTypeChange("organic", e.target.checked)}
                    />
                    <label htmlFor="organic" className="text-sm">
                      Organic Farmers
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="fish" 
                      className="rounded text-[#227C4F] mr-2" 
                      checked={farmerTypes.includes("fish")}
                      onChange={(e) => handleFarmerTypeChange("fish", e.target.checked)}
                    />
                    <label htmlFor="fish" className="text-sm">
                      Fish Farmers
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="poultry" 
                      className="rounded text-[#227C4F] mr-2" 
                      checked={farmerTypes.includes("poultry")}
                      onChange={(e) => handleFarmerTypeChange("poultry", e.target.checked)}
                    />
                    <label htmlFor="poultry" className="text-sm">
                      Poultry Farmers
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Rating</label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Rating</SelectItem>
                    <SelectItem value="4plus">4+ Stars</SelectItem>
                    <SelectItem value="3plus">3+ Stars</SelectItem>
                    <SelectItem value="2plus">2+ Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Verification</label>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="verified" 
                    className="rounded text-[#227C4F] mr-2" 
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                  />
                  <label htmlFor="verified" className="text-sm">
                    Verified Farmers Only
                  </label>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                    onClick={resetFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#F5C451]/10 p-4 rounded-lg border border-[#F5C451]/20">
            <h3 className="font-medium text-lg mb-2">Become a Vendor</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you a farmer in Sierra Leone? Join our platform to reach more customers.
            </p>
            <Button asChild variant="outline" className="w-full border-[#F5C451] text-[#227C4F]">
              <Link href="/vendor/register">
                Apply Now
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Vendors</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="new">New Vendors</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">Showing {filteredVendorCount} vendors</p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Suspense fallback={<VendorsLoading />}>
                <VendorsList 
                  searchQuery={searchQuery}
                  location={location}
                  farmerTypes={farmerTypes}
                  rating={rating}
                  verifiedOnly={verifiedOnly}
                  sortBy={sortBy}
                  onVendorClick={handleVendorClick}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="featured" className="mt-0">
              <Suspense fallback={<VendorsLoading />}>
                <VendorsList filter="featured" onVendorClick={handleVendorClick} />
              </Suspense>
            </TabsContent>

            <TabsContent value="new" className="mt-0">
              <Suspense fallback={<VendorsLoading />}>
                <VendorsList filter="new" onVendorClick={handleVendorClick} />
              </Suspense>
            </TabsContent>

            <TabsContent value="popular" className="mt-0">
              <Suspense fallback={<VendorsLoading />}>
                <VendorsList filter="popular" onVendorClick={handleVendorClick} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Vendor Profile Modal */}
      <VendorProfileModal 
        vendor={selectedVendor}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </main>
  )
}
