"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Package, 
  ShoppingBag, 
  Users, 
  Star, 
  MessageSquare, 
  FileText,
  Search,
  Heart,
  ShoppingCart,
  AlertCircle
} from "lucide-react"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "secondary"
  }
  className?: string
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && (
          <div className="mb-4 text-muted-foreground">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
        )}
        {action && (
          <Button 
            onClick={action.onClick} 
            variant={action.variant || "default"}
            className="bg-[#227C4F] hover:bg-[#1b6a43]"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Specific empty states
export function EmptyProducts({ onAddProduct }: { onAddProduct?: () => void }) {
  return (
    <EmptyState
      icon={<Package className="h-12 w-12" />}
      title="No products found"
      description="Get started by adding your first product to showcase your farm's offerings."
      action={onAddProduct ? {
        label: "Add Product",
        onClick: onAddProduct
      } : undefined}
    />
  )
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={<ShoppingBag className="h-12 w-12" />}
      title="No orders yet"
      description="Your orders will appear here once customers start purchasing your products."
    />
  )
}

export function EmptyCustomers() {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title="No customers yet"
      description="Customer information will be displayed here as they make purchases from your farm."
    />
  )
}

export function EmptyReviews() {
  return (
    <EmptyState
      icon={<Star className="h-12 w-12" />}
      title="No reviews yet"
      description="Customer reviews and ratings will appear here to help build trust with potential buyers."
    />
  )
}

export function EmptyMessages({ onCompose }: { onCompose?: () => void }) {
  return (
    <EmptyState
      icon={<MessageSquare className="h-12 w-12" />}
      title="No messages"
      description="Your conversations with customers will appear here."
      action={onCompose ? {
        label: "Start Conversation",
        onClick: onCompose,
        variant: "outline"
      } : undefined}
    />
  )
}

export function EmptySearchResults({ searchTerm }: { searchTerm?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-12 w-12" />}
      title="No results found"
      description={searchTerm 
        ? `No products found for "${searchTerm}". Try adjusting your search terms.`
        : "Try adjusting your search or filters to find what you're looking for."
      }
    />
  )
}

export function EmptyWishlist({ onBrowseProducts }: { onBrowseProducts?: () => void }) {
  return (
    <EmptyState
      icon={<Heart className="h-12 w-12" />}
      title="Your wishlist is empty"
      description="Save products you love to easily find them later."
      action={onBrowseProducts ? {
        label: "Browse Products",
        onClick: onBrowseProducts
      } : undefined}
    />
  )
}

export function EmptyCart({ onBrowseProducts }: { onBrowseProducts?: () => void }) {
  return (
    <EmptyState
      icon={<ShoppingCart className="h-12 w-12" />}
      title="Your cart is empty"
      description="Add some fresh products from our local farmers to get started."
      action={onBrowseProducts ? {
        label: "Start Shopping",
        onClick: onBrowseProducts
      } : undefined}
    />
  )
}

export function EmptyDisputes() {
  return (
    <EmptyState
      icon={<AlertCircle className="h-12 w-12" />}
      title="No disputes"
      description="Disputes and issues will appear here when they need your attention."
    />
  )
}

export function EmptyReports() {
  return (
    <EmptyState
      icon={<FileText className="h-12 w-12" />}
      title="No reports available"
      description="Generate reports to track your business performance and analytics."
    />
  )
}

// Generic empty state for tables
export function EmptyTable({ 
  title = "No data available",
  description = "Data will appear here when available.",
  action
}: {
  title?: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-muted-foreground">
        <FileText className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm">{description}</p>
      {action && (
        <Button 
          onClick={action.onClick}
          variant="outline"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
