"use client"

import { useTheme } from "next-themes"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Jan", sales: 400000 },
  { name: "Feb", sales: 300000 },
  { name: "Mar", sales: 500000 },
  { name: "Apr", sales: 450000 },
  { name: "May", sales: 470000 },
  { name: "Jun", sales: 600000 },
  { name: "Jul", sales: 650000 },
  { name: "Aug", sales: 700000 },
  { name: "Sep", sales: 550000 },
  { name: "Oct", sales: 450000 },
  { name: "Nov", sales: 400000 },
  { name: "Dec", sales: 380000 },
]

export function VendorSalesChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#227C4F" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#227C4F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            tick={{ fill: isDark ? "#A1A1AA" : "#6B7280" }}
            axisLine={{ stroke: isDark ? "#3F3F46" : "#E5E7EB" }}
            tickLine={{ stroke: isDark ? "#3F3F46" : "#E5E7EB" }}
          />
          <YAxis
            tickFormatter={(value) => `Le ${value / 1000}k`}
            tick={{ fill: isDark ? "#A1A1AA" : "#6B7280" }}
            axisLine={{ stroke: isDark ? "#3F3F46" : "#E5E7EB" }}
            tickLine={{ stroke: isDark ? "#3F3F46" : "#E5E7EB" }}
          />
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#3F3F46" : "#E5E7EB"} />
          <Tooltip
            formatter={(value: number) => [`Le ${value.toLocaleString()}`, "Sales"]}
            contentStyle={{
              backgroundColor: isDark ? "#27272A" : "#FFFFFF",
              borderColor: isDark ? "#3F3F46" : "#E5E7EB",
              borderRadius: "0.375rem",
            }}
            labelStyle={{ color: isDark ? "#FFFFFF" : "#111827" }}
          />
          <Area type="monotone" dataKey="sales" stroke="#227C4F" fillOpacity={1} fill="url(#colorSales)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
