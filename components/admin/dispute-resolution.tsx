"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, User, Package, DollarSign, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface Dispute {
  _id: string
  orderId: string
  complainant: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  respondent: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  reason: string
  description: string
  evidence: string[]
  status: 'open' | 'under_review' | 'resolved' | 'closed'
  resolution?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

interface DisputeResolutionProps {
  disputeId: string
  onResolutionUpdate: (disputeId: string, resolution: string, notes?: string) => void
  onClose: () => void
}

export function DisputeResolution({ disputeId, onResolutionUpdate, onClose }: DisputeResolutionProps) {
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [resolution, setResolution] = useState("")
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchDisputeDetails()
  }, [disputeId])

  const fetchDisputeDetails = async () => {
    try {
      const response = await fetch(`/api/admin/disputes/${disputeId}`)
      if (response.ok) {
        const data = await response.json()
        setDispute(data.dispute)
        setResolution(data.dispute.resolution || "")
        setNotes(data.dispute.adminNotes || "")
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch dispute details",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dispute details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResolutionSubmit = async () => {
    if (!dispute || !resolution.trim()) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/disputes/${disputeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resolution,
          adminNotes: notes,
          status: 'resolved'
        })
      })

      if (response.ok) {
        onResolutionUpdate(disputeId, resolution, notes)
        toast({
          title: "Success",
          description: "Dispute resolved successfully",
        })
        onClose()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to resolve dispute",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve dispute",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleCloseDispute = async () => {
    if (!dispute) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/disputes/${disputeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'closed',
          adminNotes: notes
        })
      })

      if (response.ok) {
        onResolutionUpdate(disputeId, "Dispute closed without resolution", notes)
        toast({
          title: "Success",
          description: "Dispute closed successfully",
        })
        onClose()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to close dispute",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close dispute",
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

  if (!dispute) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Dispute not found</AlertDescription>
      </Alert>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-red-100 text-red-800">Open</Badge>
      case 'under_review':
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dispute Resolution</h2>
        {getStatusBadge(dispute.status)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Complainant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Complainant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">
              {dispute.complainant.firstName} {dispute.complainant.lastName}
            </p>
            <p className="text-sm text-gray-600">{dispute.complainant.email}</p>
          </CardContent>
        </Card>

        {/* Respondent Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Respondent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">
              {dispute.respondent.firstName} {dispute.respondent.lastName}
            </p>
            <p className="text-sm text-gray-600">{dispute.respondent.email}</p>
          </CardContent>
        </Card>
      </div>

      {/* Dispute Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Dispute Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-500">Order ID</Label>
            <p className="font-mono">{dispute.orderId}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Reason</Label>
            <p>{dispute.reason}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500">Description</Label>
            <p className="whitespace-pre-wrap">{dispute.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Evidence */}
      {dispute.evidence && dispute.evidence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dispute.evidence.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolution Form */}
      {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
        <Card>
          <CardHeader>
            <CardTitle>Resolution</CardTitle>
            <CardDescription>
              Provide a resolution for this dispute
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="resolution">Resolution Decision</Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter your resolution decision..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
        <div className="flex gap-4">
          <Button
            onClick={handleResolutionSubmit}
            disabled={updating || !resolution.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Resolve Dispute
          </Button>
          <Button
            onClick={handleCloseDispute}
            disabled={updating}
            variant="outline"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Close Without Resolution
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

      {dispute.status === 'resolved' && (
        <Card>
          <CardHeader>
            <CardTitle>Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{dispute.resolution}</p>
            {dispute.adminNotes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-500">Admin Notes</Label>
                <p className="text-sm mt-1">{dispute.adminNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(dispute.status === 'resolved' || dispute.status === 'closed') && (
        <div className="flex gap-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      )}
    </div>
  )
}
