import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowUp } from "lucide-react"

interface VendorStatsCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

export function VendorStatsCard({ title, value, description, icon, trend = "neutral" }: VendorStatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-[#227C4F]/10 p-2 text-[#227C4F]">{icon}</div>
          {trend !== "neutral" && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
              )}
            >
              {trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span>{trend === "up" ? "Increase" : "Decrease"}</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="mt-1 text-2xl font-bold text-gray-800">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
