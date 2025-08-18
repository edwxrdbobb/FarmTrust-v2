"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const farmerTypes = [
  { value: "organic", label: "Organic Farmer" },
  { value: "waste-to-resource", label: "Waste-to-Resource Farmer" },
  { value: "fish", label: "Fish Farmer" },
  { value: "cattle", label: "Cattle Farmer" },
]

const districts = [
  "Bo District", "Bombali District", "Bonthe District", "Falaba District",
  "Kailahun District", "Kambia District", "Karene District", "Kenema District",
  "Koinadugu District", "Kono District", "Moyamba District", "Port Loko District",
  "Pujehun District", "Tonkolili District", "Western Area Rural District", "Western Area Urban District"
]

export default function VendorOnboardingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    farmName: "",
    description: "",
    location: "",
    district: "",
    farmerType: "",
    phone: "",
    website: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/vendor/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create vendor profile')
      }

      toast({
        title: "Vendor Profile Created",
        description: "Your vendor profile has been created successfully. You can now start adding products!",
        variant: "default",
      })

      // Redirect to vendor dashboard
      router.replace("/vendor/dashboard")
    } catch (error) {
      console.error('Vendor registration error:', error)
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <VendorSidebar>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Complete Your Vendor Profile</h1>
          <p className="text-gray-600 mt-2">
            Please provide your farm details to start selling on FarmTrust.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="farmName">Farm Name *</Label>
                <Input
                  id="farmName"
                  placeholder="e.g. Green Valley Farm"
                  value={formData.farmName}
                  onChange={(e) => handleInputChange("farmName", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your farm and what makes your products special..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farmerType">Farmer Type *</Label>
                  <Select value={formData.farmerType} onValueChange={(value) => handleInputChange("farmerType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select farmer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {farmerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="district">District *</Label>
                  <Select value={formData.district} onValueChange={(value) => handleInputChange("district", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Farm Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g. Village name, area, or specific location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +232 76 123 456"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="e.g. https://myfarm.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-[#227C4F] hover:bg-[#1b6a43]" 
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Vendor Profile
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push("/vendor/dashboard")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </VendorSidebar>
  )
}