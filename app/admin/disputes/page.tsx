"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
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

type Dispute = {
  id: string
  orderId: string
  complainantName: string
  complainantEmail: string
  type: "delivery_issue" | "product_quality" | "payment_dispute" | "seller_behavior" | "other"
  status: "open" | "under_review" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  createdAt: string
  updatedAt: string
  description: string
  requestedAmount?: number
  evidence?: string[]
}

// Mock data - will be replaced with API call
const disputes: Dispute[] = [
  {
    id: "d1",
    orderId: "ORD-2024-001",
    complainantName: "James Koroma",
    complainantEmail: "james.koroma@example.com",
    type: "delivery_issue",
    status: "open",
    priority: "high",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    description: "Order was supposed to be delivered yesterday but still not received. Seller is not responding to messages.",
    requestedAmount: 50000,
  },
  {
    id: "d2",
    orderId: "ORD-2024-002",
    complainantName: "Aminata Sesay",
    complainantEmail: "aminata.sesay@example.com",
    type: "product_quality",
    status: "under_review",
    priority: "medium",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-16T09:15:00Z",
    description: "Received cassava that was partially rotten. Photos attached showing the condition.",
    evidence: ["photo1.jpg", "photo2.jpg"],
  },
  {
    id: "d3",
    orderId: "ORD-2024-003",
    complainantName: "Mohamed Bangura",
    complainantEmail: "mohamed.bangura@example.com",
    type: "payment_dispute",
    status: "resolved",
    priority: "urgent",
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-17T11:30:00Z",
    description: "Payment was deducted twice for the same order. Need refund for duplicate charge.",
    requestedAmount: 75000,
  },
  {
    id: "d4",
    orderId: "ORD-2024-004",
    complainantName: "Fatmata Kamara",
    complainantEmail: "fatmata.kamara@example.com",
    type: "seller_behavior",
    status: "closed",
    priority: "low",
    createdAt: "2024-01-12T08:15:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
    description: "Seller was rude and unprofessional during delivery. Refused to accept return of damaged items.",
  },
]

export default function AdminDisputesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [action, setAction] = useState<"escalate" | "close" | "resolve">("escalate")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [disputesData, setDisputesData] = useState<Dispute[]>([])

  // Fetch disputes from API
  useEffect(() => {
    fetchDisputes()
  }, [activeTab])

  const fetchDisputes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(activeTab !== "all" && { status: activeTab }),
      })

      const response = await fetch(`/api/admin/disputes?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch disputes')
      }
      const data = await response.json()
      setDisputesData(data.disputes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch disputes')
      // Fallback to mock data for now
      setDisputesData(disputes)
    } finally {
      setLoading(false)
    }
  }

  const filteredDisputes = activeTab === "all" 
    ? disputesData 
    : disputesData.filter((dispute) => dispute.status === activeTab)

  const handleAction = async () => {
    if (!selectedDispute) return

    try {
      const response = await fetch(`/api/admin/disputes/${selectedDispute.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === "resolve" ? "resolved" : action === "close" ? "closed" : "under_review",
          adminNotes: action === "escalate" ? "Dispute escalated for further review" : 
                     action === "resolve" ? "Dispute resolved by admin" : "Dispute closed by admin",
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update dispute')
      }

      // Update local state
      setDisputesData(prev => prev.map(dispute => 
        dispute.id === selectedDispute.id 
          ? { 
              ...dispute, 
              status: action === "resolve" ? "resolved" : action === "close" ? "closed" : "under_review",
              updatedAt: new Date().toISOString()
            }
          : dispute
      ))

      toast({
        title: "Dispute updated",
        description: `Dispute has been ${action === "resolve" ? "resolved" : action === "close" ? "closed" : "escalated"}.`,
      })

      setShowActionDialog(false)
      setSelectedDispute(null)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update dispute. Please try again.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Dispute>[] = [
    {
      accessorKey: "complainantName",
      header: "Complainant",
      cell: ({ row }) => {
        const dispute = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{dispute.complainantName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{dispute.complainantName}</div>
              <div className="text-sm text-gray-500">{dispute.complainantEmail}</div>
              <div className="text-sm text-gray-500">Order: {dispute.orderId}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        const getTypeIcon = (type: string) => {
          switch (type) {
            case "delivery_issue": return <AlertTriangle className="h-4 w-4 text-orange-500" />
            case "product_quality": return <XCircle className="h-4 w-4 text-red-500" />
            case "payment_dispute": return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case "seller_behavior": return <XCircle className="h-4 w-4 text-red-500" />
            default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
          }
        }
        return (
          <div className="flex items-center gap-2">
            {getTypeIcon(type)}
            <Badge variant="outline">
              {type.replace("_", " ")}
            </Badge>
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
            case "resolved": return <CheckCircle className="h-4 w-4 text-green-500" />
            case "closed": return <XCircle className="h-4 w-4 text-gray-500" />
            case "under_review": return <Clock className="h-4 w-4 text-blue-500" />
            default: return <AlertTriangle className="h-4 w-4 text-orange-500" />
          }
        }
        return (
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <Badge
              className={
                status === "resolved" ? "bg-green-500" :
                status === "closed" ? "bg-gray-500" :
                status === "under_review" ? "bg-blue-500" :
                "bg-orange-500"
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
              priority === "urgent" ? "bg-red-500" :
              priority === "high" ? "bg-orange-500" :
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
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      accessorKey: "requestedAmount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue("requestedAmount") as number
        return (
          <div className="text-sm text-gray-500">
            {amount ? `SLL ${amount.toLocaleString()}` : "N/A"}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const dispute = row.original

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
                  <Link href={`/admin/disputes/${dispute.id}`} className="flex w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {dispute.status === "open" && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedDispute(dispute)
                        setAction("escalate")
                        setShowActionDialog(true)
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Escalate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedDispute(dispute)
                        setAction("resolve")
                        setShowActionDialog(true)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedDispute(dispute)
                        setAction("close")
                        setShowActionDialog(true)
                      }}
                      className="text-red-500"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Close
                    </DropdownMenuItem>
                  </>
                )}
                {dispute.status === "under_review" && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedDispute(dispute)
                        setAction("resolve")
                        setShowActionDialog(true)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedDispute(dispute)
                        setAction("close")
                        setShowActionDialog(true)
                      }}
                      className="text-red-500"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Close
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {action === "escalate" ? "Escalate Dispute" :
                     action === "resolve" ? "Resolve Dispute" :
                     "Close Dispute"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {action === "escalate" ? 
                      `Are you sure you want to escalate this dispute for further review?` :
                     action === "resolve" ? 
                      `Are you sure you want to mark this dispute as resolved?` :
                      `Are you sure you want to close this dispute? This action cannot be undone.`
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleAction}
                    className={action === "close" ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    {action === "escalate" ? "Escalate" :
                     action === "resolve" ? "Resolve" :
                     "Close"}
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
  const totalDisputes = disputesData.length
  const openDisputes = disputesData.filter((dispute) => dispute.status === "open").length
  const underReviewDisputes = disputesData.filter((dispute) => dispute.status === "under_review").length
  const resolvedDisputes = disputesData.filter((dispute) => dispute.status === "resolved").length

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dispute Management</h1>
            <p className="text-gray-500">Review and manage customer disputes</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading disputes...</p>
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
            <h1 className="text-2xl font-bold text-gray-800">Dispute Management</h1>
            <p className="text-gray-500">Review and manage customer disputes</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-gray-500">Error loading disputes: {error}</p>
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
          <h1 className="text-2xl font-bold text-gray-800">Dispute Management</h1>
          <p className="text-gray-500">Review and manage customer disputes</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDisputes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Open</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{openDisputes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{underReviewDisputes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{resolvedDisputes}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Disputes</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="under_review">Under Review</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable columns={columns} data={filteredDisputes} searchKey="complainantName" searchPlaceholder="Search disputes..." />
      </div>
    </AdminLayout>
  )
}
