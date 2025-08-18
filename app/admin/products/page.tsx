"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

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

type Product = {
  id: string
  name: string
  farmer: string
  category: string
  price: string
  stock: number
  status: "active" | "out_of_stock" | "draft" | "archived"
  image?: string
}

const products: Product[] = [
  {
    id: "p1",
    name: "Fresh Cassava Roots",
    farmer: "Aminata Sesay",
    category: "Root Vegetables",
    price: "Le 50,000/kg",
    stock: 25,
    status: "active",
    image: "/fresh-cassava.png",
  },
  {
    id: "p2",
    name: "Plantain Bunch",
    farmer: "Ibrahim Conteh",
    category: "Fruits",
    price: "Le 75,000/bunch",
    stock: 12,
    status: "active",
    image: "/plantains-bunch.png",
  },
  {
    id: "p3",
    name: "Palm Oil",
    farmer: "Fatmata Kamara",
    category: "Oils",
    price: "Le 50,000/liter",
    stock: 30,
    status: "active",
    image: "/palm-oil-plantation.png",
  },
  {
    id: "p4",
    name: "Rice (Local)",
    farmer: "Mohamed Bangura",
    category: "Grains",
    price: "Le 120,000/bag",
    stock: 0,
    status: "out_of_stock",
    image: "/bowl-of-steamed-rice.png",
  },
  {
    id: "p5",
    name: "Sweet Potatoes",
    farmer: "Mariama Jalloh",
    category: "Root Vegetables",
    price: "Le 40,000/kg",
    stock: 18,
    status: "active",
    image: "/roasted-sweet-potatoes.png",
  },
  {
    id: "p6",
    name: "Groundnuts",
    farmer: "Abdul Kargbo",
    category: "Nuts",
    price: "Le 35,000/kg",
    stock: 40,
    status: "active",
    image: "/groundnuts.png",
  },
  {
    id: "p7",
    name: "Okra",
    farmer: "Isatu Turay",
    category: "Vegetables",
    price: "Le 25,000/kg",
    stock: 5,
    status: "draft",
    image: "/fresh-okra.png",
  },
]

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const [isArchiving, setIsArchiving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productsData, setProductsData] = useState<Product[]>([])

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
  }, [activeTab])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(activeTab !== "all" && { status: activeTab }),
      })

      const response = await fetch(`/api/admin/products?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProductsData(data.data?.products || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      // Fallback to mock data for now
      setProductsData(products)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = activeTab === "all" ? productsData : productsData.filter((product) => product.status === activeTab)

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="font-medium">{product.name}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "farmer",
      header: "Farmer",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "stock",
      header: ({ column }) => {
        return (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Stock
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number
        return <div className={stock === 0 ? "text-red-500" : ""}>{stock} units</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge
            className={
              status === "active"
                ? "bg-green-500"
                : status === "out_of_stock"
                  ? "bg-red-500"
                  : status === "draft"
                    ? "bg-[#F5C451]"
                    : "bg-gray-500"
            }
          >
            {status.replace("_", " ")}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original

        const handleArchive = async () => {
          try {
            setIsArchiving(true)
            setSelectedProduct(product)
            
            const response = await fetch('/api/admin/products', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                productId: product.id,
                action: 'archive_product',
                data: {}
              }),
            })

            if (response.ok) {
              toast({
                title: "Product archived",
                description: `${product.name} has been archived.`,
              })
              fetchProducts() // Refresh the list
            } else {
              throw new Error('Failed to archive product')
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to archive product",
              variant: "destructive",
            })
          } finally {
            setIsArchiving(false)
          }
        }

        const handleDelete = async () => {
          try {
            const response = await fetch('/api/admin/products', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                productId: selectedProduct?.id,
                action: 'delete_product',
                data: {}
              }),
            })

            if (response.ok) {
              setShowDeleteDialog(false)
              toast({
                title: "Product deleted",
                description: `${selectedProduct?.name} has been deleted.`,
              })
              fetchProducts() // Refresh the list
            } else {
              throw new Error('Failed to delete product')
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to delete product",
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
                  <Link href={`/admin/products/${product.id}`} className="flex w-full">
                    View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={`/admin/products/${product.id}/edit`} className="flex w-full">
                    Edit product
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchive} disabled={isArchiving && selectedProduct?.id === product.id}>
                  {isArchiving && selectedProduct?.id === product.id
                    ? "Archiving..."
                    : product.status === "archived"
                      ? "Unarchive product"
                      : "Archive product"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setShowDeleteDialog(true)
                    setSelectedProduct(product)
                  }}
                  className="text-red-500"
                >
                  Delete product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {selectedProduct?.name}. This action cannot be undone.
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

  // Calculate product statistics
  const totalProducts = products.length
  const activeProducts = products.filter((product) => product.status === "active").length
  const outOfStock = products.filter((product) => product.status === "out_of_stock").length
  const draftProducts = products.filter((product) => product.status === "draft" || product.status === "archived").length

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <p className="text-gray-500">Manage all products on the platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{activeProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Out of Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{outOfStock}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Draft/Archived</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-500">{draftProducts}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="out_of_stock">Out of Stock</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>
        </Tabs>

        <DataTable
          columns={columns}
          data={filteredProducts}
          searchKey="name"
          searchPlaceholder="Search products..."
        />
      </div>
    </AdminLayout>
  )
}
