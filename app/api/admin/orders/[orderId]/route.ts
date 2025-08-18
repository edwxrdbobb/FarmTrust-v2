import { NextRequest, NextResponse } from "next/server";
import * as orderService from "@/services/order_service";
import * as userRepo from "@/repositories/user_repo";
import { connectDB } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { orderId } = params;

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate admin
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Get order (admin can view any order)
    const result = await orderService.getOrderById(orderId);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: result.error?.includes("not found") ? 404 : 500 }
      );
    }

    return NextResponse.json({
      message: "Order retrieved successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Admin Order Get API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { orderId } = params;
    const { status } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { message: "Order status is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Validate admin
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Update order status (admin override)
    const result = await orderService.updateOrderStatus(orderId, status);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: result.error?.includes("not found") ? 404 : 500 }
      );
    }

    return NextResponse.json({
      message: "Order status updated successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Admin Order Update API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}