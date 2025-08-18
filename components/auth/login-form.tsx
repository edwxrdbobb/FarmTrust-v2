
"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuthContext } from "@/context/AuthContext"

function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case "vendor":
      return "/vendor/dashboard"
    case "admin":
      return "/admin/dashboard"
    case "buyer":
    default:
      return "/products"
  }
}

function LoginFormContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { signIn, loading, user } = useAuthContext()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const { user: loggedInUser } = await signIn(formData.email, formData.password)
      
      toast({
        title: "Login successful",
        description: "Welcome back to FarmTrust!",
      })
      
      console.log(`Login Role: ${loggedInUser.role}`)
      console.log("Starting redirect process...")
      
      // Add a small delay to ensure auth state is updated
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Handle redirect after successful login
      const redirectParam = searchParams.get("redirect")
      console.log("Redirect param:", redirectParam)
      
      if (redirectParam) {
        console.log(`Redirecting to: ${redirectParam}`)
        window.location.href = redirectParam
      } else {
        const roleBasedRedirect = getRoleBasedRedirect(loggedInUser.role)
        console.log(`Redirecting to role-based route: ${roleBasedRedirect}`)
        window.location.href = roleBasedRedirect
      }
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Please check your credentials and try again.")
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
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
            <div className="flex justify-between items-center">
              <Label className="text-gray-500" htmlFor="password">Password</Label>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
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
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="rememberMe" checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} />
            <Label htmlFor="rememberMe" className="text-sm text-green-500 font-normal cursor-pointer">
              Remember me for 30 days
            </Label>
          </div>
        </div>

        <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90 py-6" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
      {error && (
        <div className="text-red-600 text-sm mt-2 text-center">{error}</div>
      )}
    </>
  )
}

export function LoginForm() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  )
}
