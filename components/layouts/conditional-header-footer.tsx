"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/common/site-header"
import { SiteFooter } from "@/components/common/site-footer"

interface ConditionalHeaderFooterProps {
  children: React.ReactNode
}

export function ConditionalHeaderFooter({ children }: ConditionalHeaderFooterProps) {
  const pathname = usePathname()
  const isVendorPage = pathname.startsWith('/vendor')

  return (
    <>
      {!isVendorPage && <SiteHeader />}
      {children}
      {!isVendorPage && <SiteFooter />}
    </>
  )
}
