import { NextRequest, NextResponse } from "next/server"
import * as orderService from "@/services/order_service"
import * as productService from "@/services/product_service"
import * as userService from "@/services/auth_service"
import { connectDB } from "@/lib/db"

async function getVendorFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  if (!token) return null
  
  const isValid = await userService.isTokenValid(token)
  if (!isValid.success || !isValid.user || isValid.user.role !== 'vendor') return null
  
  return isValid.user
}

export async function GET(request: NextRequest) {
  try {
    const vendor = await getVendorFromToken(request)
    if (!vendor) {
      return NextResponse.json(
        { message: "Unauthorized - Vendor access required" },
        { status: 401 }
      )
    }

    await connectDB()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const limit = parseInt(searchParams.get("limit") || "5")

    if (type === "recent-orders") {
      // Get recent orders for this vendor
      const result = await orderService.getVendorOrders(vendor.id, 1, limit)

      if (!result.success) {
        return NextResponse.json(
          { message: result.error },
          { status: 400 }
        )
      }

      return NextResponse.json({
        message: "Recent orders fetched successfully",
        orders: result.data?.orders || []
      })
    }

    // Get dashboard stats
    const [ordersResult, productsResult] = await Promise.all([
      orderService.getVendorOrders(vendor.id, 1, 100),
      productService.getProductsByVendor(vendor.id, 1, 100)
    ])

    if (!ordersResult.success || !productsResult.success) {
      return NextResponse.json(
        { message: "Failed to fetch dashboard data" },
        { status: 400 }
      )
    }

    const orders = ordersResult.data?.orders || []
    const products = productsResult.products || []

    // Calculate stats
    const totalSales = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
    const totalOrders = orders.length
    const activeProducts = products.filter((p: any) => p.status === 'active').length
    const pendingOrders = orders.filter((o: any) => o.status === 'pending').length

    // Calculate average rating from products
    const totalRating = products.reduce((sum: number, product: any) => sum + (product.averageRating || 0), 0)
    const averageRating = products.length > 0 ? parseFloat((totalRating / products.length).toFixed(1)) : 0

    return NextResponse.json({
      message: "Dashboard data fetched successfully",
      stats: {
        totalSales,
        totalOrders,
        activeProducts,
        pendingOrders,
        averageRating
      },
      recentOrders: orders.slice(0, 5)
    })
  } catch (error) {
    console.error("Error in vendor dashboard API:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}