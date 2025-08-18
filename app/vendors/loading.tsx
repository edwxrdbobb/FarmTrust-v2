import { Skeleton } from "@/components/ui/skeleton"

export default function VendorsLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-[250px]" />
        </div>
      </div>

      <div className="bg-[#F7FAF9] p-4 md:p-6 rounded-xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64">
          <Skeleton className="h-[500px] rounded-lg" />
        </div>

        <div className="flex-1">
          <Skeleton className="h-10 w-full mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(9)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[280px] rounded-lg" />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
