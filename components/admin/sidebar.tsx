import { cn } from "@/lib/utils"
import { useState } from "react"
import Link from "next/link"
import { ScrollArea } from "../ui/scroll-area"

export default function Sidebar({ routes }: { routes: any }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    
  return (
    <>
            <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-[#227C4F]">FarmTrust</span>
            <span className="ml-1 text-xl font-bold">Admin</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] py-4">
          <div className="space-y-1 px-3">
            {routes.map((route: any) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  route.active
                    ? "bg-[#227C4F] bg-opacity-10 text-[#227C4F]"
                    : "text-gray-600 hover:bg-[#227C4F] hover:bg-opacity-10 hover:text-[#227C4F]",
                )}
              >
                <route.icon className={cn("mr-3 h-5 w-5", route.active ? "text-[#227C4F]" : "text-gray-500")} />
                {route.label}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  )
}