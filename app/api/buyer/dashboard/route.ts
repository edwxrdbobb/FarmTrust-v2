import { NextRequest, NextResponse } from "next/server"
// import { verifyAuth } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { Order } from "@/models/order_model"
import { Product } from "@/models/product_model"
import { Review } from "@/models/review_model"

export async function GET(request: NextRequest) {
  try {
    const authResult = await false
    // const authResult = await verifyAuth(request)
    // if (!authResult.success || !authResult.user) {
    //   return NextResponse.json(
    //     { error: "Authentication required" },
    //     { status: 401 }
    //   )
    // }

    const user = authResult.user
    if (user.role !== "buyer" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Buyer access required." },
        { status: 403 }
      )
    }

    await connectDB()
    
    // Get user's orders statistics
    const orders = await Order.find({ buyerId: user._id }).populate('items.productId')
    
    const activeOrders = orders.filter(order => 
      ['pending', 'confirmed', 'shipped', 'in_transit'].includes(order.status)
    ).length
    
    const completedOrders = orders.filter(order => 
      order.status === 'delivered'
    ).length
    
    // Get recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        status: order.status,
        total: order.totalAmount,
        itemCount: order.items.length,
        items: order.items.map(item => ({
          name: item.productId.name,
          quantity: item.quantity,
          price: item.price
        }))
      }))

    // Get product recommendations based on order history
    const orderedProductIds = orders.flatMap(order => 
      order.items.map(item => item.productId._id)
    )
    
    // Find products from same categories as previously ordered products
    const orderedProducts = await Product.find({ 
      _id: { $in: orderedProductIds } 
    }).select('category')
    
    const categories = [...new Set(orderedProducts.map(p => p.category))]
    
    const recommendations = await Product.find({
      category: { $in: categories },
      _id: { $nin: orderedProductIds },
      status: 'active'
    })
    .populate('vendorId', 'businessName farmName')
    .limit(6)
    .lean()

    const recommendedProducts = recommendations.map(product => ({
      id: product._id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.images?.[0] || null,
      vendor: product.vendorId?.businessName || product.vendorId?.farmName,
      category: product.category
    }))

    // Calculate next delivery date (earliest pending/confirmed order)
    const nextDeliveryOrder = orders.find(order => 
      ['pending', 'confirmed', 'shipped'].includes(order.status)
    )
    const nextDelivery = nextDeliveryOrder?.estimatedDeliveryDate || null

    // Get recent notifications (mock for now - you can implement a real notification system)
    const notifications = [
      {
        id: 1,
        title: "Order Update",
        message: recentOrders.length > 0 
          ? `Your order ${recentOrders[0].orderNumber} is being processed` 
          : "Welcome to FarmTrust! Start shopping for fresh local produce.",
        time: new Date().toISOString(),
        read: false,
        type: "order"
      },
      {
        id: 2,
        title: "New Products Available",
        message: "Fresh seasonal vegetables are now available from local farmers.",
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        type: "product"
      }
    ]

    const dashboardData = {
      stats: {
        activeOrders,
        completedOrders,
        savedItems: 0, // TODO: Implement wishlist
        nextDelivery: nextDelivery ? new Date(nextDelivery).toLocaleDateString() : null
      },
      recentOrders,
      recommendations: recommendedProducts,
      savedItems: [], // TODO: Implement wishlist
      notifications,
      user: {
        name: user.name,
        email: user.email,
        joinDate: user.createdAt
      }
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
