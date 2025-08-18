export default function AdminProductDetailsPage({ params }: { params: { productId: string } }) {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">Admin Product Details: {params.productId}</h1>
    </div>
  )
}
