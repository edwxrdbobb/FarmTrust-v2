import { Skeleton } from "@/components/ui/skeleton"

export default function VendorProfileLoading() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Cover Image Skeleton */}
      <Skeleton className="w-full h-64 md:h-80 rounded-xl mb-6" />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Skeleton */}
        <div className="w-full md:w-80">
          <div className="bg-white rounded-xl border p-5">
            <div className="flex flex-col items-center mb-4">
              <Skeleton className="w-24 h-24 rounded-full mb-3" />
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>

            <Skeleton className="h-px w-full my-4" />

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-3" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>

            <Skeleton className="h-px w-full my-4" />

            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-px w-full my-4" />

            <Skeleton className="h-5 w-32 mb-2" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-24" />
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1">
          <Skeleton className="h-10 w-full mb-6" />

          <div className="bg-white rounded-xl border p-6 mb-6">
            <Skeleton className="h-7 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />

            <Skeleton className="h-6 w-40 mb-3" />
            <div className="space-y-2 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <Skeleton className="h-3 w-3 rounded-full mr-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
