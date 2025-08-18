import { NextRequest, NextResponse } from "next/server"
import * as userService from "@/services/auth_service"
import * as orderRepo from "@/repositories/order_repo"
import * as productRepo from "@/repositories/product_repo"
// Ensure all models are registered
import "@/models/index"
import * as userRepo from "@/repositories/user_repo"
import * as disputeRepo from "@/repositories/dispute_repo"
import * as farmerRequestRepo from "@/repositories/farmer_request_repo"
import * as escrowRepo from "@/repositories/escrow_repo"
import { connectDB } from "@/lib/db"

async function getAdminFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value
  if (!token) return null
  
  const isValid = await userService.isTokenValid(token)
  if (!isValid.success || !isValid.user || isValid.user?.role !== 'admin') return null
  
  return isValid.user
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request)
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    await connectDB()

    // Fetch all data in parallel to avoid duplicate queries
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      activeDisputes,
      pendingFarmerRequests,
      escrowAnalytics,
      recentOrders,
      recentUsers,
      recentDisputes,
      allFarmerRequests
    ] = await Promise.all([
      userRepo.countUsers(),
      orderRepo.getOrders({}, { limit: 1000 }), // Get all orders for stats
      productRepo.getProducts({}, { limit: 1000 }), // Get all products for stats
      disputeRepo.getDisputes({ status: 'open' }),
      farmerRequestRepo.getFarmerRequests({ status: 'pending' }),
      escrowRepo.getEscrowAnalytics(), // Escrow analytics
      orderRepo.getRecentOrders(5), // Recent orders
      userRepo.getUsers({}), // Recent users
      disputeRepo.getDisputes({}, { sort: { createdAt: -1 }, limit: 5 }), // Recent disputes
      farmerRequestRepo.getFarmerRequests({}, { limit: 1000 }) // All farmer requests for stats
    ])

    // Calculate metrics from fetched data
    const orders = totalOrders || []
    const products = totalProducts || []
    const users = recentUsers || []
    const farmerRequests = allFarmerRequests || []
    
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0)
    const pendingOrders = orders.filter((order: any) => order.status === 'pending').length
    const activeProducts = products.filter((product: any) => product.available && !product.deleted_at).length

    // Calculate user statistics
    const totalUserCount = users.length
    const newUsersThisMonth = users.filter((user: any) => {
      const userDate = new Date(user.createdAt)
      const now = new Date()
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
    }).length

    // Calculate farmer request statistics
    const totalFarmerRequests = farmerRequests.length
    const approvedThisWeek = farmerRequests.filter((req: any) => {
      const reqDate = new Date(req.updatedAt)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return req.status === 'approved' && reqDate >= weekAgo
    }).length

    // Calculate trust scores (simplified)
    const averageFarmerTrustScore = 4.2 // This would be calculated from actual data
    const averageBuyerTrustScore = 4.5 // This would be calculated from actual data
    const disputedTransactions = orders.length > 0 ? 
      (orders.filter((order: any) => order.status === 'disputed').length / orders.length * 100).toFixed(1) : '0.0'

    return NextResponse.json({
      message: "Admin dashboard data fetched successfully",
      data: {
        users: {
          totalUsers: totalUserCount,
          newUsers: newUsersThisMonth,
          activeUsers: Math.round(totalUserCount * 0.7) // Simplified calculation
        },
        sales: {
          totalRevenue,
          totalOrders: orders.length
        },
        orders: {
          pendingDeliveries: pendingOrders
        },
        disputes: {
          activeDisputes: activeDisputes.length
        },
        products: {
          totalProducts: products.length,
          activeProducts
        },
        farmerRequests: {
          pending: pendingFarmerRequests.length,
          approvedThisWeek,
          total: totalFarmerRequests
        },
        escrow: {
          totalEscrows: escrowAnalytics.totalEscrows || 0,
          pendingEscrows: escrowAnalytics.pendingEscrows || 0,
          totalAmount: escrowAnalytics.totalAmount || 0,
          pendingAmount: escrowAnalytics.pendingAmount || 0,
          releaseRate: escrowAnalytics.releaseRate || 0,
          refundRate: escrowAnalytics.refundRate || 0
        },
        trustScores: {
          averageFarmerTrustScore,
          averageBuyerTrustScore,
          disputedTransactions: `${disputedTransactions}%`
        },
        recent: {
          orders: recentOrders.slice(0, 5),
          users: recentUsers.slice(0, 5),
          disputes: recentDisputes.slice(0, 5)
        }
      }
    })
  } catch (error) {
    console.error("Error in admin dashboard API:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
