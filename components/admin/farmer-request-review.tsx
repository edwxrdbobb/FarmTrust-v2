"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Clock, User, MapPin, Phone, Mail, FileText, AlertCircle } from "lucide-react"

interface FarmerRequest {
  _id: string
  userId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  farmName: string
  farmerType: string
  location: string
  experience: string
  documents: string[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  adminNotes?: string
}

interface FarmerRequestReviewProps {
  requestId: string
  onStatusUpdate: (requestId: string, status: string, notes?: string) => void
  onClose: () => void
}

export function FarmerRequestReview({ requestId, onStatusUpdate, onClose }: FarmerRequestReviewProps) {
  const [request, setRequest] = useState<FarmerRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchRequestDetails()
  }, [requestId])

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`/api/admin/farmer-requests/${requestId}`)
      if (response.ok) {
        const data = await response.json()
        setRequest(data.request)
        setNotes(data.request.adminNotes || "")
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch request details",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch request details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!request) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/farmer-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          adminNotes: notes
        })
      })

      if (response.ok) {
        onStatusUpdate(requestId, status, notes)
        toast({
          title: "Success",
          description: `Request ${status} successfully`,
        })
        onClose()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to update request",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!request) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Request not found</AlertDescription>
      </Alert>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Farmer Request Review</h2>
        <div className="flex items-center gap-2">
          {getStatusIcon(request.status)}
          {getStatusBadge(request.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applicant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Applicant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Name</Label>
              <p className="text-lg font-medium">
                {request.userId.firstName} {request.userId.lastName}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {request.userId.email}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Phone</Label>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {request.userId.phone}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Farm Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Farm Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Farm Name</Label>
              <p className="text-lg font-medium">{request.farmName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Farmer Type</Label>
              <p>{request.farmerType}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Location</Label>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {request.location}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Experience</Label>
              <p>{request.experience}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      {request.documents && request.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submitted Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {request.documents.map((doc, index) => (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <a
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Document {index + 1}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Notes</CardTitle>
          <CardDescription>
            Add notes about your decision (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your review notes here..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {request.status === 'pending' && (
        <div className="flex gap-4">
          <Button
            onClick={() => handleStatusUpdate('approved')}
            disabled={updating}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve Request
          </Button>
          <Button
            onClick={() => handleStatusUpdate('rejected')}
            disabled={updating}
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject Request
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            disabled={updating}
          >
            Cancel
          </Button>
        </div>
      )}

      {request.status !== 'pending' && (
        <div className="flex gap-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      )}
    </div>
  )
}
