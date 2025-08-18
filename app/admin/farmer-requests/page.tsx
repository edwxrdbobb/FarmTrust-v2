"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type FarmerRequest = {
  id: string
  farmerName: string
  email: string
  phone: string
  status: "pending" | "approved" | "rejected" | "requires_documents"
  priority: "low" | "medium" | "high"
  submittedDate: string
  documents: string[]
  notes?: string
}

// Mock data - will be replaced with API call
const requests: FarmerRequest[] = [
  {
    id: "fr1",
    farmerName: "Aminata Sesay",
    email: "aminata.sesay@example.com",
    phone: "+232 88 123 456",
    status: "pending",
    priority: "medium",
    submittedDate: "2024-01-15",
    documents: ["id_card.pdf", "land_deed.pdf"],
  },
  {
    id: "fr2",
    farmerName: "Fatmata Kamara",
    email: "fatmata.kamara@example.com",
    phone: "+232 88 234 567",
    status: "approved",
    priority: "high",
    submittedDate: "2024-01-10",
    documents: ["id_card.pdf", "land_deed.pdf", "bank_statement.pdf"],
  },
  {
    id: "fr3",
    farmerName: "Mariama Jalloh",
    email: "mariama.jalloh@example.com",
    phone: "+232 88 345 678",
    status: "requires_documents",
    priority: "low",
    submittedDate: "2024-01-20",
    documents: ["id_card.pdf"],
    notes: "Missing land deed and bank statement",
  },
  {
    id: "fr4",
    farmerName: "Ibrahim Conteh",
    email: "ibrahim.conteh@example.com",
    phone: "+232 88 456 789",
    status: "rejected",
    priority: "medium",
    submittedDate: "2024-01-12",
    documents: ["id_card.pdf"],
    notes: "Incomplete documentation and invalid land deed",
  },
]

export default function AdminFarmerRequestsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<FarmerRequest | null>(null)
  const [action, setAction] = useState<"approve" | "reject" | "request_documents">("approve")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestsData, setRequestsData] = useState<FarmerRequest[]>([])

  // Fetch farmer requests from API
  useEffect(() => {
    fetchRequests()
  }, [activeTab])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(activeTab !== "all" && { status: activeTab }),
      })

      const response = await fetch(`/api/admin/farmer-requests?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch farmer requests')
      }
      const data = await response.json()
      setRequestsData(data.requests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch farmer requests')
      // Fallback to mock data for now
      setRequestsData(requests)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = activeTab === "all" 
    ? requestsData 
    : requestsData.filter((request) => request.status === activeTab)

  const handleAction = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/admin/farmer-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "requires_documents",
          notes: action === "reject" ? "Request rejected by admin" : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update request')
      }

      // Update local state
      setRequestsData(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: action === "approve" ? "approved" : action === "reject" ? "rejected" : "requires_documents" }
          : req
      ))

      toast({
        title: "Request updated",
        description: `Farmer request has been ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "marked for additional documents"}.`,
      })

      setShowActionDialog(false)
      setSelectedRequest(null)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<FarmerRequest>[] = [
    {
      accessorKey: "farmerName",
      header: "Farmer",
      cell: ({ row }) => {
        const request = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{request.farmerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{request.farmerName}</div>
              <div className="text-sm text-gray-500">{request.email}</div>
              <div className="text-sm text-gray-500">{request.phone}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const getStatusIcon = (status: string) => {
          switch (status) {
            case "approved": return <CheckCircle className="h-4 w-4 text-green-500" />
            case "rejected": return <XCircle className="h-4 w-4 text-red-500" />
            case "requires_documents": return <Clock className="h-4 w-4 text-yellow-500" />
            default: return <Clock className="h-4 w-4 text-gray-500" />
          }
        }
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Badge
              className={
                status === "approved" ? "bg-green-500" :
                status === "rejected" ? "bg-red-500" :
                status === "requires_documents" ? "bg-yellow-500" :
                "bg-gray-500"
              }
            >
              {status.replace("_", " ")}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        return (
          <Badge
            className={
              priority === "high" ? "bg-red-500" :
              priority === "medium" ? "bg-yellow-500" :
              "bg-green-500"
            }
          >
            {priority}
          </Badge>
        )
      },
    },
    {
      accessorKey: "submittedDate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Submitted
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("submittedDate"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      accessorKey: "documents",
      header: "Documents",
      cell: ({ row }) => {
        const documents = row.getValue("documents") as string[]
        return (
          <div className="text-sm text-gray-500">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const request = row.original

        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link href={`/admin/farmer-requests/${request.id}`} className="flex w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {request.status === "pending" && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedRequest(request)
                        setAction("approve")
                        setShowActionDialog(true)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedRequest(request)
                        setAction("reject")
                        setShowActionDialog(true)
                      }}
                      className="text-red-500"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedRequest(request)
                        setAction("request_documents")
                        setShowActionDialog(true)
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Request documents
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {action === "approve" ? "Approve Farmer Request" :
                     action === "reject" ? "Reject Farmer Request" :
                     "Request Additional Documents"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {action === "approve" ? 
                      `Are you sure you want to approve ${selectedRequest?.farmerName}'s farmer verification request?` :
                     action === "reject" ? 
                      `Are you sure you want to reject ${selectedRequest?.farmerName}'s farmer verification request?` :
                      `Request additional documents from ${selectedRequest?.farmerName}?`
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleAction}
                    className={action === "reject" ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    {action === "approve" ? "Approve" :
                     action === "reject" ? "Reject" :
                     "Request Documents"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )
      },
    },
  ]

  // Calculate statistics
  const totalRequests = requestsData.length
  const pendingRequests = requestsData.filter((req) => req.status === "pending").length
  const approvedRequests = requestsData.filter((req) => req.status === "approved").length
  const rejectedRequests = requestsData.filter((req) => req.status === "rejected").length

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Farmer Verification</h1>
            <p className="text-gray-500">Review and manage farmer verification requests</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading requests...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Farmer Verification</h1>
            <p className="text-gray-500">Review and manage farmer verification requests</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-gray-500">Error loading requests: {error}</p>
              <p className="text-sm text-gray-400 mt-1">Using fallback data</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Farmer Verification</h1>
          <p className="text-gray-500">Review and manage farmer verification requests</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{approvedRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{rejectedRequests}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="requires_documents">Needs Documents</TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable columns={columns} data={filteredRequests} searchKey="farmerName" searchPlaceholder="Search farmers..." />
      </div>
    </AdminLayout>
  )
}
