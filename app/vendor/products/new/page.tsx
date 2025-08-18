import type { Metadata } from "next"
import Link from "next/link"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"
import { ProductForm } from "@/components/vendor/vendor-product-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Add New Product | Vendor Dashboard",
  description: "Add a new product to your farm inventory",
}

export default function NewProductPage() {
  return (
    <VendorSidebar>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/vendor/products">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-gray-500">Create a new product to sell on FarmTrust</p>
        </div>
      </div>

      <ProductForm />
    </VendorSidebar>
  )
}
