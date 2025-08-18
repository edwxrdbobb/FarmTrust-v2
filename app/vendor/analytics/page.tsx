import type { Metadata } from "next"
import { VendorSidebar } from "@/components/vendor/vendor-sidebar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VendorStatsCard } from "@/components/vendor/vendor-stats-card"
import { Download } from "lucide-react"

export const metadata: Metadata = {
  title: "Analytics | Vendor Dashboard",
  description: "View your farm business analytics",
}

export default function VendorAnalyticsPage() {
  return (
    <VendorSidebar>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-500">
            Track your farm's performance and sales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px] rounded-xl border-gray-300">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="rounded-xl border-gray-300"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <VendorStatsCard
          title="Total Sales"
          value="Le 2,456,000"
          change="+12.5%"
          trend="up"
        />
      </div>
    </VendorSidebar>
  )
}
