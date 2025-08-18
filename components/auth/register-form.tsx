

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuthContext } from "@/context/AuthContext"


export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    accountType: "buyer",
    agreeTerms: false,
  })
  const router = useRouter()
  const { toast } = useToast()
  const { signUp, loading, refreshAuth, user } = useAuthContext()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, accountType: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeTerms: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.agreeTerms) {
      toast({
        title: "Terms agreement required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await signUp({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.accountType,
      })
      
      toast({
        title: "Registration successful",
        description: "Welcome to FarmTrust! Your account has been created.",
      })
      
      // Add a delay to ensure authentication cookie is properly set
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Refresh authentication state to ensure we have the latest user info
      await refreshAuth()
      
      // Wait a bit more to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Verify user is authenticated before redirect
      if (result && result.user) {
        // Additional client-side verification
        try {
          const authCheck = await fetch("/api/auth/me", { 
            method: "GET",
            credentials: "include"
          })
          
          if (authCheck.ok) {
            const authData = await authCheck.json()
            if (authData.user && authData.user.role === formData.accountType) {
              // User is properly authenticated, proceed with redirect
              if (formData.accountType === "vendor") {
                router.push("/vendor/dashboard")
              } else {
                // Redirect buyers to products page instead of dashboard
                router.push("/products")
              }
            } else {
              throw new Error("Authentication role mismatch")
            }
          } else {
            throw new Error("Authentication verification failed")
          }
        } catch (authError) {
          console.error("Auth verification error:", authError)
          // Fallback: still try the redirect but with a warning
          toast({
            title: "Authentication Warning",
            description: "There might be a delay in authentication. If you're redirected to login, please try logging in.",
            variant: "destructive"
          })
          
          if (formData.accountType === "vendor") {
            router.push("/vendor/dashboard")
          } else {
            router.push("/products")
          }
        }
      } else {
        throw new Error("User registration data not available")
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "There was a problem creating your account. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-500" htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-500" htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-500" htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="rounded-xl pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
        </div>

        <div className="space-y-2">
          <Label>Account Type</Label>
          <RadioGroup
            value={formData.accountType}
            onValueChange={handleRadioChange}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="buyer" id="buyer" />
              <Label htmlFor="buyer" className="font-normal text-gray-500 cursor-pointer">
                Buyer - I want to purchase products
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vendor" id="vendor" />
              <Label htmlFor="vendor" className="font-normal text-gray-500 cursor-pointer">
                Vendor - I want to sell my products
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="agreeTerms"
            checked={formData.agreeTerms}
            onCheckedChange={handleCheckboxChange}
            className="mt-1"
          />
          <Label htmlFor="agreeTerms" className="text-sm font-normal text-gray-500 cursor-pointer">
            I agree to the{" "}
            <Link href="/common/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/common/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90 py-6" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  )
}
