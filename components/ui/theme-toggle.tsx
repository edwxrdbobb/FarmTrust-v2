"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder button to avoid hydration mismatch
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "relative h-10 w-10 rounded-full border-2 transition-all duration-300",
          "bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg",
          "border-gray-200 hover:border-gray-300",
          className
        )}
        disabled
        {...props}
      >
        <div className="h-4 w-4 animate-pulse bg-gray-300 rounded-full" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "relative h-10 w-10 rounded-full border-2 transition-all duration-500 overflow-hidden group",
        "bg-gradient-to-br shadow-lg hover:shadow-xl transform hover:scale-110",
        isDark 
          ? "from-gray-800 to-gray-900 border-gray-600 hover:border-gray-500 text-yellow-400" 
          : "from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300 text-orange-600",
        className
      )}
      onClick={handleToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      {...props}
    >
      {/* Background animation */}
      <div 
        className={cn(
          "absolute inset-0 transition-all duration-500 ease-in-out",
          isDark 
            ? "bg-gradient-to-br from-slate-800 via-gray-800 to-gray-900" 
            : "bg-gradient-to-br from-yellow-100 via-orange-50 to-yellow-50"
        )}
      />
      
      {/* Icon container with smooth transitions */}
      <div className="relative z-10 transition-all duration-500">
        <Sun 
          className={cn(
            "h-4 w-4 absolute transition-all duration-500 ease-in-out",
            isDark 
              ? "scale-0 rotate-90 opacity-0" 
              : "scale-100 rotate-0 opacity-100"
          )}
        />
        <Moon 
          className={cn(
            "h-4 w-4 absolute transition-all duration-500 ease-in-out",
            isDark 
              ? "scale-100 rotate-0 opacity-100" 
              : "scale-0 -rotate-90 opacity-0"
          )}
        />
      </div>
      
      {/* Animated glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full blur-md transition-all duration-500 opacity-0 group-hover:opacity-30",
          isDark 
            ? "bg-yellow-400/50" 
            : "bg-orange-400/50"
        )}
      />
    </Button>
  )
}

// Alternative compact version for mobile/smaller spaces
export function ThemeToggleCompact({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("h-8 w-8 rounded-lg", className)}
        disabled
        {...props}
      >
        <div className="h-3 w-3 animate-pulse bg-gray-300 rounded-full" />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 w-8 rounded-lg transition-all duration-300 hover:scale-110",
        isDark 
          ? "text-yellow-400 hover:bg-gray-800 hover:text-yellow-300" 
          : "text-orange-600 hover:bg-yellow-50 hover:text-orange-700",
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      {...props}
    >
      {isDark ? (
        <Sun className="h-3 w-3 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Moon className="h-3 w-3 transition-transform duration-300 hover:-rotate-12" />
      )}
    </Button>
  )
}
