"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, AlertCircle, Mail, Phone } from "lucide-react"

interface FarmerRequest {
  id: string
  farmName: string
  description: string
  status: "pending" | "approved" | "rejected" | "more-info-needed"
  createdAt: string
  adminNotes?: string
  rejectionReason?: string
}

export default function PendingApprovalPage() {
  const router = useRouter()
  const [farmerRequest, setFarmerRequest] = useState<FarmerRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkFarmerRequestStatus()
  }, [])

  const checkFarmerRequestStatus = async () => {
    try {
      const response = await fetch('/api/farmer-requests/my-request', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setFarmerRequest(data.farmerRequest)
        
        // If approved, redirect to vendor dashboard
        if (data.farmerRequest.status === 'approved') {
          router.push('/vendor/dashboard')
        }
      } else {
        // No farmer request found, redirect to registration
        router.push('/vendor/register')
      }
    } catch (error) {
      console.error('Error checking farmer request status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'more-info-needed':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'more-info-needed':
        return <Badge variant="outline" className="border-orange-300 text-orange-700">More Info Needed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return "Your farmer request is currently under review by our admin team. This usually takes 24-48 hours."
      case 'approved':
        return "Congratulations! Your farmer request has been approved. You can now start selling on FarmTrust."
      case 'rejected':
        return "Your farmer request has been rejected. Please review the feedback below and try again."
      case 'more-info-needed':
        return "We need more information to process your request. Please check the admin notes below."
      default:
        return "Your request status is unknown. Please contact support."
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your request status...</p>
        </div>
      </div>
    )
  }

  if (!farmerRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No farmer request found. Please register first.</p>
          <Button 
            onClick={() => router.push('/vendor/register')}
            className="mt-4 bg-[#227C4F] hover:bg-[#1b6a43]"
          >
            Start Registration
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Farmer Request Status</h1>
          <p className="text-gray-600 mt-2">
            Track the status of your farmer registration request
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(farmerRequest.status)}
                {farmerRequest.farmName}
              </CardTitle>
              {getStatusBadge(farmerRequest.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Message */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{getStatusMessage(farmerRequest.status)}</p>
            </div>

            {/* Farm Details */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Farm Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Farm Name:</strong> {farmerRequest.farmName}</p>
                <p><strong>Description:</strong> {farmerRequest.description}</p>
                <p><strong>Submitted:</strong> {new Date(farmerRequest.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Admin Notes */}
            {farmerRequest.adminNotes && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Admin Notes</h3>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">{farmerRequest.adminNotes}</p>
                </div>
              </div>
            )}

            {/* Rejection Reason */}
            {farmerRequest.rejectionReason && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Rejection Reason</h3>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-800">{farmerRequest.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              {farmerRequest.status === 'rejected' && (
                <Button 
                  onClick={() => router.push('/vendor/register')}
                  className="flex-1 bg-[#227C4F] hover:bg-[#1b6a43]"
                >
                  Apply Again
                </Button>
              )}
              
              {farmerRequest.status === 'more-info-needed' && (
                <Button 
                  onClick={() => router.push('/vendor/register')}
                  className="flex-1 bg-[#227C4F] hover:bg-[#1b6a43]"
                >
                  Update Information
                </Button>
              )}

              {farmerRequest.status === 'approved' && (
                <Button 
                  onClick={() => router.push('/vendor/dashboard')}
                  className="flex-1 bg-[#227C4F] hover:bg-[#1b6a43]"
                >
                  Go to Dashboard
                </Button>
              )}

              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="flex-1"
              >
                Back to Home
              </Button>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Email: support@farmtrust.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone: +232 76 123 456</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <Button 
            variant="outline" 
            onClick={checkFarmerRequestStatus}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Refresh Status'}
          </Button>
        </div>
      </div>
    </div>
  )
}
