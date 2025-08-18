"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
  onClick?: () => void
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
  onClick
}: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "neutral":
        return <Minus className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getTrendTextColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      case "neutral":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Card 
      className={cn(
        "border-none shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:scale-105",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-[#227C4F]">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {value}
        </div>
        {(description || trendValue) && (
          <div className="flex items-center gap-2 text-xs">
            {trend && trendValue && (
              <div className={cn("flex items-center gap-1", getTrendTextColor())}>
                {getTrendIcon()}
                <span>{trendValue}</span>
              </div>
            )}
            {description && (
              <span className="text-gray-500">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Specialized stats card variants
export function SalesStatsCard({
  amount,
  change,
  period = "vs last month",
  ...props
}: {
  amount: number
  change?: number
  period?: string
} & Omit<StatsCardProps, "value" | "trend" | "trendValue">) {
  const trend = change ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : undefined
  const trendValue = change ? `${change > 0 ? "+" : ""}${change.toFixed(1)}%` : undefined

  return (
    <StatsCard
      {...props}
      value={`Le ${amount.toLocaleString()}`}
      trend={trend}
      trendValue={trendValue}
      description={period}
    />
  )
}

export function CountStatsCard({
  count,
  change,
  period = "vs last month",
  ...props
}: {
  count: number
  change?: number
  period?: string
} & Omit<StatsCardProps, "value" | "trend" | "trendValue">) {
  const trend = change ? (change > 0 ? "up" : change < 0 ? "down" : "neutral") : undefined
  const trendValue = change ? `${change > 0 ? "+" : ""}${change.toFixed(0)}` : undefined

  return (
    <StatsCard
      {...props}
      value={count.toLocaleString()}
      trend={trend}
      trendValue={trendValue}
      description={period}
    />
  )
}

export function RatingStatsCard({
  rating,
  maxRating = 5,
  totalReviews,
  ...props
}: {
  rating: number | null | undefined
  maxRating?: number
  totalReviews?: number
} & Omit<StatsCardProps, "value" | "description">) {
  // Ensure rating is a valid number
  const validRating = typeof rating === 'number' && !isNaN(rating) ? rating : 0
  
  const description = totalReviews 
    ? `Based on ${totalReviews} reviews`
    : "Average rating"

  return (
    <StatsCard
      {...props}
      value={`${validRating.toFixed(1)}/${maxRating}`}
      description={description}
    />
  )
}
