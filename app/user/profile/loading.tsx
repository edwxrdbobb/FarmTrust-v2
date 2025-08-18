import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function RecentOrdersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[180px]" />
        <Skeleton className="h-4 w-[250px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white rounded-lg border"
            >
              <div className="flex flex-col mb-2 md:mb-0 space-y-2">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
              <div className="flex flex-col md:items-end space-y-2">
                <Skeleton className="h-5 w-[90px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Skeleton className="h-10 w-[150px] mx-auto" />
        </div>
      </CardContent>
    </Card>
  )
}
