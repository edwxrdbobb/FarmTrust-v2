"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
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

type User = {
  id: string
  name: string
  email: string
  role: "buyer" | "farmer" | "admin"
  status: "active" | "inactive" | "suspended"
  joinDate: string
  avatar?: string
}

// Mock data - will be replaced with API call
const users: User[] = [
  {
    id: "u1",
    name: "James Koroma",
    email: "james.koroma@example.com",
    role: "buyer",
    status: "active",
    joinDate: "2023-01-15",
    avatar: "/abstract-geometric-shapes.png",
  },
  {
    id: "u2",
    name: "Aminata Sesay",
    email: "aminata.sesay@example.com",
    role: "farmer",
    status: "active",
    joinDate: "2023-02-10",
    avatar: "/abstract-geometric-shapes.png",
  },
  {
    id: "u3",
    name: "Mohamed Bangura",
    email: "mohamed.bangura@example.com",
    role: "buyer",
    status: "inactive",
    joinDate: "2023-03-05",
    avatar: "/abstract-geometric-shapes.png",
  },
  {
    id: "u4",
    name: "Fatmata Kamara",
    email: "fatmata.kamara@example.com",
    role: "farmer",
    status: "active",
    joinDate: "2023-03-20",
    avatar: "/abstract-geometric-shapes.png",
  },
  {
    id: "u5",
    name: "Ibrahim Conteh",
    email: "ibrahim.conteh@example.com",
    role: "buyer",
    status: "suspended",
    joinDate: "2023-04-12",
    avatar: "/abstract-geometric-shapes.png",
  },
  {
    id: "u6",
    name: "Mariama Jalloh",
    email: "mariama.jalloh@example.com",
    role: "farmer",
    status: "active",
    joinDate: "2023-04-25",
    avatar: "/abstract-geometric-shapes.png",
  },
  {
    id: "u7",
    name: "Abdul Kargbo",
    email: "abdul.kargbo@example.com",
    role: "admin",
    status: "active",
    joinDate: "2023-01-05",
    avatar: "/abstract-geometric-shapes.png",
  },
]

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usersData, setUsersData] = useState<User[]>([])

  // Fetch users from API
  useEffect(() => {
    fetchUsers()
  }, [activeTab])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(activeTab !== "all" && { role: activeTab }),
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsersData(data.data?.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      // Fallback to mock data for now
      setUsersData(users)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = activeTab === "all" ? usersData : usersData.filter((user) => user.role === activeTab)

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <Badge className={role === "admin" ? "bg-purple-500" : role === "farmer" ? "bg-[#438DBB]" : "bg-[#F5C451]"}>
            {role}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            className={status === "active" ? "bg-green-500" : status === "inactive" ? "bg-gray-500" : "bg-red-500"}
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "joinDate",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Join Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = new Date(row.getValue("joinDate"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original

        const handleStatusChange = async (newStatus: string) => {
          try {
            const response = await fetch('/api/admin/users', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                action: 'update_status',
                data: { status: newStatus }
              }),
            })

            if (response.ok) {
              toast({
                title: "User status updated",
                description: `${user.name}'s status has been changed to ${newStatus}.`,
              })
              fetchUsers() // Refresh the list
            } else {
              throw new Error('Failed to update user status')
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to update user status",
              variant: "destructive",
            })
          }
        }

        const handleDelete = async () => {
          try {
            const response = await fetch('/api/admin/users', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                action: 'delete_user',
                data: {}
              }),
            })

            if (response.ok) {
              setShowDeleteDialog(false)
              toast({
                title: "User deleted",
                description: `${user.name} has been deleted from the system.`,
              })
              fetchUsers() // Refresh the list
            } else {
              throw new Error('Failed to delete user')
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to delete user",
              variant: "destructive",
            })
          }
        }

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
                  <Link href={`/admin/users/${user.id}`} className="flex w-full">
                    View user
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={`/admin/users/${user.id}/edit`} className="flex w-full">
                    Edit user
                  </Link>
                </DropdownMenuItem>
                {user.status === "active" ? (
                  <DropdownMenuItem onClick={() => handleStatusChange("suspended")}>Suspend user</DropdownMenuItem>
                ) : user.status === "suspended" ? (
                  <DropdownMenuItem onClick={() => handleStatusChange("active")}>Activate user</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleStatusChange("active")}>Activate user</DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    setShowDeleteDialog(true)
                    setSelectedUser(user)
                  }}
                  className="text-red-500"
                >
                  Delete user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedUser?.name}'s account. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )
      },
    },
  ]

  // Calculate user statistics
  const totalUsers = usersData.length
  const activeUsers = usersData.filter((user) => user.status === "active").length
  const farmers = usersData.filter((user) => user.role === "farmer").length
  const buyers = usersData.filter((user) => user.role === "buyer").length

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-500">Manage all users on the platform</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading users...</p>
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
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-500">Manage all users on the platform</p>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-gray-500">Error loading users: {error}</p>
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
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500">Manage all users on the platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Farmers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#438DBB]">{farmers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Buyers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#F5C451]">{buyers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="buyer">Buyers</TabsTrigger>
            <TabsTrigger value="farmer">Farmers</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable columns={columns} data={filteredUsers} searchKey="name" searchPlaceholder="Search users..." />
      </div>
    </AdminLayout>
  )
}
