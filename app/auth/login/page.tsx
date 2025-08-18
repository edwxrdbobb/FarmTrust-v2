import Link from "next/link"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/common/site-header"
import { SiteFooter } from "@/components/common/site-footer"
import { LoginForm } from "@/components/auth/login-form"
import { LoginPageWrapper } from "@/components/auth/login-page-wrapper"
import { Leaf } from "lucide-react"

export const metadata: Metadata = {
  title: "Login | FarmTrust",
  description: "Login to your FarmTrust account",
}

export default function LoginPage() {
  return (
    <LoginPageWrapper>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Left side - Form */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex items-center justify-center">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-2">
                  <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Welcome back</h1>
                <p className="text-gray-600 mt-2">Sign in to your FarmTrust account</p>
              </div>

              <LoginForm />

              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="hidden md:block md:w-1/2 bg-[url('/sierra-leone-farmer-market.png')] bg-cover bg-center">
            <div className="h-full w-full bg-primary/60 p-10 flex items-end">
              <div className="text-white max-w-md">
                <h2 className="text-2xl font-bold mb-4">Supporting Local Agriculture</h2>
                <p className="text-white/90">
                  By using FarmTrust, you're directly supporting Sierra Leone's farmers and contributing to sustainable
                  agricultural practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LoginPageWrapper>
  )
}
