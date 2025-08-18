import { ProductCard } from "@/components/buyer/product-card"

interface RelatedProductsProps {
  products: Array<{
    id: string
    name: string
    price: number
    unit: string
    image: string
    vendor: string
    badge?: string
  }>
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
