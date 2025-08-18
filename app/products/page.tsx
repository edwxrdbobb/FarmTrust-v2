import type { Metadata } from "next"
import { ProductsClient } from "@/components/buyer/products-client"

export const metadata: Metadata = {
  title: "Products | FarmTrust",
  description: "Browse fresh produce from verified farmers in Sierra Leone",
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <ProductsClient />
    </div>
  )
}
