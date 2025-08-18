import { NextRequest, NextResponse } from "next/server";
import * as orderService from "@/services/order_service";
import * as userRepo from "@/repositories/user_repo";
import { connectDB } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const vendorId = searchParams.get('vendorId'); // optional filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    // Parse dates if provided
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    // Get order analytics
    const result = await orderService.getOrderAnalytics(
      vendorId || undefined,
      start,
      end
    );

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Order analytics retrieved successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Admin Order Analytics API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}