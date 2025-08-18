"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, Circle, Upload, Eye, EyeOff } from "lucide-react"
import { ImageUpload } from "@/components/vendor/image-upload"

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

interface FormData {
  // Step 1: Basic Info
  fullName: string
  email: string
  password: string
  confirmPassword: string
  accountType: string
  
  // Step 2: Identity Verification
  nationalIdPhoto: string
  selfieWithId: string
  phone: string
  
  // Step 3: Farm Details
  farmName: string
  description: string
  location: string
  district: string
  farmerType: string
  yearsOfExperience: number
  farmSize: {
    value: number
    unit: string
  }
}

export default function VendorRegistrationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "vendor",
    nationalIdPhoto: "",
    selfieWithId: "",
    phone: "",
    farmName: "",
    description: "",
    location: "",
    district: "",
    farmerType: "",
    yearsOfExperience: 0,
    farmSize: { value: 0, unit: "acres" }
  })

  const steps = [
    { id: 1, title: "Basic Info", description: "Account details" },
    { id: 2, title: "Identity Verification", description: "Upload documents" },
    { id: 3, title: "Farm Details", description: "Business information" },
    { id: 4, title: "Email Verification", description: "Verify your email" }
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (field: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: url
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fullName && formData.email && formData.password && 
                 formData.confirmPassword && formData.password === formData.confirmPassword)
      case 2:
        return !!(formData.nationalIdPhoto && formData.selfieWithId && formData.phone)
      case 3:
        return !!(formData.farmName && formData.description && formData.location && 
                 formData.district && formData.farmerType)
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Step 1: Register user
      const userResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.accountType,
          phone: formData.phone
        }),
      })

      if (!userResponse.ok) {
        const error = await userResponse.json()
        throw new Error(error.message || 'Registration failed')
      }

      const userResult = await userResponse.json()

      // Step 2: Send verification email
      const emailResponse = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userResult.token}`
        },
        body: JSON.stringify({
          email: formData.email
        }),
      })

      if (!emailResponse.ok) {
        console.warn('Failed to send verification email, but continuing with registration')
      }

      // Step 3: Create farmer request
      const farmerRequestResponse = await fetch('/api/farmer-requests', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userResult.token}`
        },
        body: JSON.stringify({
          farmName: formData.farmName,
          description: formData.description,
          location: formData.location,
          farmerType: formData.farmerType,
          documents: [formData.nationalIdPhoto, formData.selfieWithId],
          contactPhone: formData.phone,
          yearsOfExperience: formData.yearsOfExperience,
          farmSize: formData.farmSize
        }),
      })

      if (!farmerRequestResponse.ok) {
        const error = await farmerRequestResponse.json()
        throw new Error(error.message || 'Failed to create farmer request')
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created! Please check your email to verify your account, then wait for admin approval.",
        variant: "default",
      })

      // Redirect to pending approval page
      router.push("/vendor/onboarding/pending-approval")

    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="accountType">Account Type *</Label>
              <Select value={formData.accountType} onValueChange={(value) => handleInputChange("accountType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor">Vendor/Farmer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>National ID Photo *</Label>
              <ImageUpload
                onUpload={(url) => handleImageUpload("nationalIdPhoto", url)}
                currentImage={formData.nationalIdPhoto}
                placeholder="Upload a clear photo of your National ID"
              />
            </div>

            <div>
              <Label>Selfie with National ID *</Label>
              <ImageUpload
                onUpload={(url) => handleImageUpload("selfieWithId", url)}
                currentImage={formData.selfieWithId}
                placeholder="Upload a selfie holding your National ID"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g. +232 76 123 456"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This will be used for Monime payouts later
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
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
              <Label htmlFor="description">Farm Description *</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your farm and what makes your products special..."
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
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange("yearsOfExperience", parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="farmSize">Farm Size</Label>
                <div className="flex gap-2">
                  <Input
                    id="farmSize"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.farmSize.value}
                    onChange={(e) => handleInputChange("farmSize", { 
                      ...formData.farmSize, 
                      value: parseFloat(e.target.value) || 0 
                    })}
                  />
                  <Select 
                    value={formData.farmSize.unit} 
                    onValueChange={(value) => handleInputChange("farmSize", { 
                      ...formData.farmSize, 
                      unit: value 
                    })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acres">Acres</SelectItem>
                      <SelectItem value="hectares">Hectares</SelectItem>
                      <SelectItem value="sq_meters">Sq Meters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Email Verification Required</h3>
              <p className="text-gray-600 mt-2">
                We've sent a verification link to <strong>{formData.email}</strong>. 
                Please check your email and click the verification link to complete your registration.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong>
                <br />
                1. Check your email and click the verification link
                <br />
                2. Wait for admin approval (usually within 24-48 hours)
                <br />
                3. You'll receive an email notification when approved
                <br />
                4. Once approved, you can start selling on FarmTrust
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center">Vendor Registration</h1>
          <p className="text-gray-600 text-center mt-2">
            Join FarmTrust and start selling your farm products
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            <div className="flex gap-4 pt-6">
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  Previous
                </Button>
              )}
              
              {currentStep < 4 ? (
                <Button 
                  type="button" 
                  className="flex-1 bg-[#227C4F] hover:bg-[#1b6a43]" 
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="button" 
                  className="flex-1 bg-[#227C4F] hover:bg-[#1b6a43]" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Registration
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
