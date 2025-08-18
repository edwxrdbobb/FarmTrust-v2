import { Skeleton } from "@/components/ui/skeleton"

export function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[400px] w-full rounded-xl" />
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-20 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function ProductLoading() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-4">
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductSkeleton />

        <div className="space-y-6">
          <div>
            <div className="flex gap-2 mb-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <div className="flex items-center gap-4 mt-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-5 w-64" />

          <div className="border-t border-b border-gray-200 py-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </div>

          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>

      <div className="mt-12">
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
