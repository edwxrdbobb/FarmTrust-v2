"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, DollarSign, Shield, Clock, CheckCircle, XCircle } from "lucide-react"
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

type Escrow = {
  id: string
  orderNumber: string
  buyerName: string
  buyerEmail: string
  vendorName: string
  amount: number
  currency: string
  status: "pending" | "funded" | "pending_confirmation" | "released_to_vendor" | "refunded_to_buyer" | "disputed" | "cancelled"
  fundedAt?: string
  deliveredAt?: string
  confirmationDeadline?: string
  buyerConfirmedAt?: string
  releasedAt?: string
  autoReleaseDate?: string
  releaseReason?: string
  refundReason?: string
  adminNotes?: string
  createdAt: string
  updatedAt: string
}

export default function AdminEscrowPage() {
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null)
  const [action, setAction] = useState<"release" | "refund" | "auto_release" | null>(null)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [escrowsData, setEscrowsData] = useState<Escrow[]>([])

  // Fetch escrows from API
  useEffect(() => {
    fetchEscrows()
  }, [activeTab])

  const fetchEscrows = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(activeTab !== "all" && { status: activeTab }),
      })

      const response = await fetch(`/api/admin/escrow?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch escrows')
      }
      const data = await response.json()
      setEscrowsData(data.escrows || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch escrows')
    } finally {
      setLoading(false)
    }
  }

  const handleEscrowAction = async () => {
    if (!selectedEscrow || !action) return

    try {
      let response;
      
      if (action === 'auto_release') {
        response = await fetch('/api/admin/escrow/auto-release', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else {
        response = await fetch('/api/admin/escrow', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: selectedEscrow.orderNumber,
            action: action === 'release' ? 'release_escrow' : 'refund_escrow',
            reason: reason || undefined
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        toast({
          title: `Escrow ${action === 'release' ? 'released' : action === 'refund' ? 'refunded' : 'auto-released'}`,
          description: data.message,
        })
        setShowActionDialog(false)
        setSelectedEscrow(null)
        setAction(null)
        setReason("")
        fetchEscrows() // Refresh the list
      } else {
        throw new Error('Failed to process escrow action')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process escrow action",
        variant: "destructive",
      })
    }
  }

  const filteredEscrows = activeTab === "all" ? escrowsData : escrowsData.filter((escrow) => escrow.status === activeTab)

  const columns: ColumnDef<Escrow>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order",
      cell: ({ row }) => {
        const escrow = row.original
        return (
          <div>
            <div className="font-medium">{escrow.orderNumber}</div>
            <div className="text-sm text-gray-500">{escrow.buyerName}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "vendorName",
      header: "Vendor",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number
        return <div className="font-medium">Le {amount.toLocaleString()}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
                 const getStatusConfig = (status: string) => {
           switch (status) {
             case "pending":
               return { label: "Pending", className: "bg-yellow-500", icon: Clock }
             case "funded":
               return { label: "Funded", className: "bg-blue-500", icon: DollarSign }
             case "pending_confirmation":
               return { label: "Pending Confirmation", className: "bg-purple-500", icon: Clock }
             case "released_to_vendor":
               return { label: "Released", className: "bg-green-500", icon: CheckCircle }
             case "refunded_to_buyer":
               return { label: "Refunded", className: "bg-red-500", icon: XCircle }
             case "disputed":
               return { label: "Disputed", className: "bg-orange-500", icon: Shield }
             case "cancelled":
               return { label: "Cancelled", className: "bg-gray-500", icon: XCircle }
             default:
               return { label: status, className: "bg-gray-500", icon: Clock }
           }
         }
        
        const config = getStatusConfig(status)
        const Icon = config.icon
        
        return (
          <Badge className={config.className}>
            <Icon className="mr-1 h-3 w-3" />
            {config.label}
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
       accessorKey: "confirmationDeadline",
       header: "Confirmation Deadline",
       cell: ({ row }) => {
         const date = row.getValue("confirmationDeadline") as string
         if (!date) return <div className="text-gray-400">N/A</div>
         const deadline = new Date(date)
         const now = new Date()
         const isOverdue = deadline < now
         return (
           <div className={isOverdue ? "text-red-500 font-medium" : ""}>
             {deadline.toLocaleDateString()}
             {isOverdue && <div className="text-xs">Overdue</div>}
           </div>
         )
       },
     },
    {
      id: "actions",
      cell: ({ row }) => {
        const escrow = row.original

                 const canRelease = escrow.status === "funded" || escrow.status === "pending_confirmation"
         const canRefund = escrow.status === "funded" || escrow.status === "pending_confirmation"

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedEscrow(escrow)
                  setAction("release")
                  setShowActionDialog(true)
                }}
                disabled={!canRelease}
              >
                Release to Vendor
              </DropdownMenuItem>
                             <DropdownMenuItem
                 onClick={() => {
                   setSelectedEscrow(escrow)
                   setAction("refund")
                   setShowActionDialog(true)
                 }}
                 disabled={!canRefund}
               >
                 Refund to Buyer
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem
                 onClick={() => {
                   setSelectedEscrow(escrow)
                   setAction("auto_release")
                   setShowActionDialog(true)
                 }}
               >
                 Process Auto-Release
               </DropdownMenuItem>
               <DropdownMenuItem>
                 View Details
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Calculate escrow statistics
  const totalEscrows = escrowsData.length
  const pendingEscrows = escrowsData.filter((escrow) => escrow.status === "pending").length
  const fundedEscrows = escrowsData.filter((escrow) => escrow.status === "funded").length
  const totalAmount = escrowsData.reduce((sum, escrow) => sum + escrow.amount, 0)
  const pendingAmount = escrowsData
    .filter((escrow) => escrow.status === "pending" || escrow.status === "funded")
    .reduce((sum, escrow) => sum + escrow.amount, 0)

  if (loading) {
    return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Escrow Management</h1>
            <p className="text-gray-500">Manage escrow transactions and protect buyers</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading escrows...</p>
            </div>
          </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Escrow Management</h1>
            <p className="text-gray-500">Manage escrow transactions and protect buyers</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-gray-500">Error loading escrows: {error}</p>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Escrow Management</h1>
          <p className="text-gray-500">Manage escrow transactions and protect buyers</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Escrows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEscrows}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingEscrows}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Funded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{fundedEscrows}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Le {totalAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Pending: Le {pendingAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

                 <Tabs defaultValue="all" onValueChange={setActiveTab}>
           <TabsList>
             <TabsTrigger value="all">All Escrows</TabsTrigger>
             <TabsTrigger value="pending">Pending</TabsTrigger>
             <TabsTrigger value="funded">Funded</TabsTrigger>
             <TabsTrigger value="pending_confirmation">Pending Confirmation</TabsTrigger>
             <TabsTrigger value="released_to_vendor">Released</TabsTrigger>
             <TabsTrigger value="refunded_to_buyer">Refunded</TabsTrigger>
           </TabsList>
         </Tabs>

        <DataTable
          columns={columns}
          data={filteredEscrows}
          searchKey="orderNumber"
          searchPlaceholder="Search escrows..."
        />

                 <AlertDialog open={showActionDialog} onOpenChange={setShowActionDialog}>
           <AlertDialogContent>
             <AlertDialogHeader>
               <AlertDialogTitle>
                 {action === "release" ? "Release Escrow to Vendor" : 
                  action === "refund" ? "Refund Escrow to Buyer" : 
                  "Process Auto-Release Escrows"}
               </AlertDialogTitle>
               <AlertDialogDescription>
                 {action === "release" 
                   ? `Are you sure you want to release the escrow for order ${selectedEscrow?.orderNumber} to the vendor?`
                   : action === "refund"
                   ? `Are you sure you want to refund the escrow for order ${selectedEscrow?.orderNumber} to the buyer?`
                   : "This will automatically release all escrows that have passed their 3-day confirmation deadline. Are you sure you want to proceed?"
                 }
                 {action !== "auto_release" && (
                   <div className="mt-4">
                     <label className="block text-sm font-medium text-gray-700">Reason (optional)</label>
                     <textarea
                       value={reason}
                       onChange={(e) => setReason(e.target.value)}
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                       rows={3}
                       placeholder="Enter reason for this action..."
                     />
                   </div>
                 )}
               </AlertDialogDescription>
             </AlertDialogHeader>
             <AlertDialogFooter>
               <AlertDialogCancel>Cancel</AlertDialogCancel>
               <AlertDialogAction 
                 onClick={handleEscrowAction}
                 className={action === "release" ? "bg-green-500 hover:bg-green-600" : 
                           action === "refund" ? "bg-red-500 hover:bg-red-600" :
                           "bg-blue-500 hover:bg-blue-600"}
               >
                 {action === "release" ? "Release" : 
                  action === "refund" ? "Refund" : 
                  "Process Auto-Release"}
               </AlertDialogAction>
             </AlertDialogFooter>
           </AlertDialogContent>
         </AlertDialog>
      </div>
  )
}
