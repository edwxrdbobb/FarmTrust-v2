import { NextRequest, NextResponse } from "next/server";
import * as orderRepo from "@/repositories/order_repo";
import * as userService from "@/services/auth_service";
import { connectDB } from "@/lib/db";

async function getAdminFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  const isValid = await userService.isTokenValid(token);
  if (!isValid.success || !isValid.user || isValid.user?.role !== 'admin') return null;
  
  return isValid.user;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    await connectDB();

    // Build filters
    const filters: any = {};
    if (status && status !== "all") {
      filters.status = status;
    }
    if (startDate) {
      filters.createdAt = { $gte: new Date(startDate) };
    }
    if (endDate) {
      if (filters.createdAt) {
        filters.createdAt.$lte = new Date(endDate);
      } else {
        filters.createdAt = { $lte: new Date(endDate) };
      }
    }

    // Get orders with pagination
    const skip = (page - 1) * limit;
    const orders = await orderRepo.getOrders(filters, {
      sort: { createdAt: -1 },
      limit,
      skip
    });
    const totalOrders = await orderRepo.countOrders(filters);

    // Transform order data for admin view
    const transformedOrders = orders.map((order: any) => ({
      id: order._id,
      orderNumber: order.orderNumber,
      buyerName: order.user?.name || 'Unknown Buyer',
      buyerEmail: order.user?.email || 'N/A',
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: order.items,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    return NextResponse.json({
      message: "Orders retrieved successfully",
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limit)
      },
    });
  } catch (error) {
    console.error("Admin Orders API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}