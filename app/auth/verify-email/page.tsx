"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [verificationUrl, setVerificationUrl] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setVerificationStatus('error')
      setMessage('No verification token provided')
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationStatus('success')
        setMessage(data.message || 'Email verified successfully!')
      } else {
        setVerificationStatus('error')
        setMessage(data.message || 'Verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationStatus('error')
      setMessage('An error occurred during verification')
    }
  }

  const handleContinue = () => {
    // Redirect to appropriate page based on user role
    router.push('/dashboard')
  }

  const handleResendEmail = () => {
    // This would typically redirect to a resend email page
    router.push('/auth/forgot-password')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Verifying your email address
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              {verificationStatus === 'loading' && (
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              )}
              {verificationStatus === 'success' && (
                <CheckCircle className="h-8 w-8 text-green-500" />
              )}
              {verificationStatus === 'error' && (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {verificationStatus === 'loading' && (
              <div>
                <p className="text-gray-600">Verifying your email address...</p>
                <div className="mt-4">
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto" />
                </div>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-gray-600">
                  Your email has been successfully verified. You can now access all features of your account.
                </p>
                <Button onClick={handleContinue} className="w-full">
                  Continue to Dashboard
                </Button>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {message}
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-gray-600">
                  The verification link may be invalid or expired. Please check your email for a new verification link.
                </p>
                <div className="space-y-2">
                  <Button onClick={handleResendEmail} variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Verification Email
                  </Button>
                  <Button onClick={() => router.push('/auth/login')} variant="ghost" className="w-full">
                    Back to Login
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Development mode - show verification URL */}
        {process.env.NODE_ENV === 'development' && verificationUrl && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-sm text-yellow-800">Development Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-yellow-700 mb-2">
                Verification URL (for testing):
              </p>
              <code className="text-xs bg-yellow-100 p-2 rounded block break-all">
                {verificationUrl}
              </code>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
