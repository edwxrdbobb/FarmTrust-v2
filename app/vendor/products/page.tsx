"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { useState } from "react"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Filter, MoreVertical, Plus, Search, Trash, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useVendorProducts } from "@/hooks/useProducts"
import { toast } from "@/components/ui/use-toast"

// Metadata removed due to "use client" directive



export default function VendorProductsPage() {
  const { products, loading, error, pagination, deleteProduct, updateProductStatus } = useVendorProducts();
  
  // Debug logging
  if (products.length > 0) {
    console.log("First product data:", products[0]);
  }
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const handleDeleteProduct = async (productId: string) => {
    const result = await deleteProduct(productId);
    if (result.success) {
      toast({
        title: "Product deleted",
        description: "Product has been successfully deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    const result = await updateProductStatus(productId, newStatus);
    if (result.success) {
      toast({
        title: "Status updated",
        description: "Product status has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      case "price_low":
        return (a.price || 0) - (b.price || 0);
      case "price_high":
        return (b.price || 0) - (a.price || 0);
      case "stock_low":
        return (a.stock || 0) - (b.stock || 0);
      case "stock_high":
        return (b.stock || 0) - (a.stock || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <VendorSidebar>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#227C4F]" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      </VendorSidebar>
    );
  }

  if (error) {
    return (
      <VendorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </VendorSidebar>
    );
  }

  return (
    <VendorSidebar>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500">Manage your farm products and inventory</p>
        </div>
        <Link href="/vendor/products/new">
          <Button className="rounded-xl bg-[#227C4F] hover:bg-[#1b6a43]">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-8 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="rounded-xl border-gray-300">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] rounded-xl border-gray-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] rounded-xl border-gray-300">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="stock_low">Stock: Low to High</SelectItem>
                <SelectItem value="stock_high">Stock: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="mt-8 text-center">
          <div className="mx-auto max-w-md">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12">
              <div className="text-center">
                <Plus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== "all" 
                    ? "No products match your filters." 
                    : "Get started by creating your first product."}
                </p>
                <div className="mt-6">
                  <Link href="/vendor/products/new">
                    <Button className="bg-[#227C4F] hover:bg-[#1b6a43]">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product, index) => (
            <ProductCard 
              key={product._id || `product-${index}`} 
              product={product}
              onDelete={handleDeleteProduct}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </VendorSidebar>
  )
}

interface ProductCardProps {
  product: {
    _id: string
    name: string
    description: string
    price: number
    unit: string
    stock: number
    images: string[]
    category: string
    featured: boolean
    status: string
    organic: boolean
    location: string
    harvestDate?: string
    created_at: string
    updated_at: string
  }
  onDelete: (productId: string) => void
  onStatusChange: (productId: string, status: string) => void
}

function ProductCard({ product, onDelete, onStatusChange }: ProductCardProps) {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      onDelete(product._id);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onStatusChange(product._id, newStatus);
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"} 
          alt={product.name} 
          className="h-full w-full object-cover" 
        />
        {product.featured && <Badge className="absolute left-2 top-2 bg-[#F5C451] text-gray-800">Featured</Badge>}
        {product.organic && <Badge className="absolute left-2 top-10 bg-green-500 text-white">Organic</Badge>}
        {product.status === "out_of_stock" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge className="bg-red-500 text-white">Out of Stock</Badge>
          </div>
        )}
        {product.status === "draft" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge className="bg-gray-500 text-white">Draft</Badge>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 text-gray-700 hover:bg-white"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/vendor/products/${product._id}/edit`} className="flex w-full items-center">
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete Product
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStatusChange("active")}>
              <Badge className="mr-2 h-2 w-2 bg-green-500" />
              Set Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("draft")}>
              <Badge className="mr-2 h-2 w-2 bg-gray-500" />
              Set Draft
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("out_of_stock")}>
              <Badge className="mr-2 h-2 w-2 bg-red-500" />
              Set Out of Stock
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg">{product.name || 'Unnamed Product'}</CardTitle>
        <CardDescription className="line-clamp-2 text-xs">{product.description || 'No description'}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-800">
            {typeof product.price === 'number' && !isNaN(product.price) ? formatCurrency(product.price) : 'Price not set'}/{product.unit || 'unit'}
          </p>
          <Badge
            variant="outline"
            className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
              product.stock > 50
                ? "border-green-200 bg-green-100 text-green-800"
                : product.stock > 0
                  ? "border-yellow-200 bg-yellow-100 text-yellow-800"
                  : "border-red-200 bg-red-100 text-red-800"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <Badge
          variant="outline"
          className="rounded-md border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
        >
          {product.category}
        </Badge>
        <Link href={`/vendor/products/${product._id}/edit`}>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg border-[#227C4F] text-[#227C4F] hover:bg-[#227C4F] hover:text-white"
          >
            Edit
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
