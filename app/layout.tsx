import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/AuthContext"
import { CartProvider } from "@/context/CartContext"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ConditionalHeaderFooter } from "@/components/layouts/conditional-header-footer"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FarmTrust | Sierra Leone's Multivendor Farmer's Market",
  description: "Connect directly with verified farmers for fresh, local produce in Sierra Leone",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress hydration warnings caused by browser extensions
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  const message = args[0];
                  if (typeof message === 'string' && 
                      (message.includes('fdprocessedid') || 
                       (message.includes('hydration') && message.includes('server rendered HTML')) ||
                       message.includes('A tree hydrated but some attributes'))) {
                    return;
                  }
                  originalError.apply(console, args);
                };
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-[#F7FAF9]`}>
        <AuthProvider>
          <CartProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <ConditionalHeaderFooter>
                {children}
              </ConditionalHeaderFooter>
              <Toaster />
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
