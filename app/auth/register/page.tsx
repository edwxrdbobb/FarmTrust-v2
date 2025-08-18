import Link from "next/link"
import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/register-form"
import { RegisterPageWrapper } from "@/components/auth/register-page-wrapper"
import { Leaf } from "lucide-react"

export const metadata: Metadata = {
  title: "Register | FarmTrust",
  description: "Create a new FarmTrust account",
}

export default function RegisterPage() {
  return (
    <RegisterPageWrapper>
      <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Image */}
        <div className="hidden md:block md:w-1/2 bg-[url('/sierra-leone-farm-produce.png')] bg-cover bg-center">
          <div className="h-full w-full bg-primary/60 p-10 flex items-end">
            <div className="text-white max-w-md">
              <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
              <p className="text-gray-100/90">
                Create an account to start buying fresh produce directly from verified farmers across Sierra Leone.
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex items-center justify-center">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-2">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Create an account</h1>
              <p className="text-gray-600 mt-2">Join FarmTrust today</p>
            </div>

            <RegisterForm />

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      </div>
    </RegisterPageWrapper>
  )
}
