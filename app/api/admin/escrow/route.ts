import { NextRequest, NextResponse } from "next/server";
import * as escrowRepo from "@/repositories/escrow_repo";
import * as orderService from "@/services/order_service";
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

    await connectDB();

    // Build filters
    const filters: any = {};
    if (status && status !== "all") {
      filters.status = status;
    }

    // Get escrows with pagination
    const skip = (page - 1) * limit;
    const escrows = await escrowRepo.getEscrows(filters, {
      sort: { createdAt: -1 },
      limit,
      skip
    });
    const totalEscrows = await escrowRepo.countEscrows(filters);

    // Transform escrow data for admin view
    const transformedEscrows = escrows.map((escrow: any) => ({
      id: escrow._id,
      orderNumber: escrow.orderId?.orderNumber || 'N/A',
      buyerName: escrow.buyerId?.name || 'Unknown Buyer',
      buyerEmail: escrow.buyerId?.email || 'N/A',
      vendorName: escrow.vendorId?.name || 'Unknown Vendor',
      amount: escrow.amount,
      currency: escrow.currency,
      status: escrow.status,
      fundedAt: escrow.fundedAt,
      releasedAt: escrow.releasedAt,
      autoReleaseDate: escrow.autoReleaseDate,
      releaseReason: escrow.releaseReason,
      refundReason: escrow.refundReason,
      adminNotes: escrow.adminNotes,
      createdAt: escrow.createdAt,
      updatedAt: escrow.updatedAt
    }));

    return NextResponse.json({
      message: "Escrows retrieved successfully",
      escrows: transformedEscrows,
      pagination: {
        page,
        limit,
        total: totalEscrows,
        totalPages: Math.ceil(totalEscrows / limit)
      },
    });
  } catch (error) {
    console.error("Admin Escrow API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { orderId, action, reason } = await request.json();

    if (!orderId || !action) {
      return NextResponse.json(
        { message: "Order ID and action are required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'release_escrow':
        result = await orderService.releaseEscrowManually(orderId, admin._id.toString(), reason);
        break;
      case 'refund_escrow':
        result = await orderService.refundEscrowManually(orderId, admin._id.toString(), reason);
        break;
      default:
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Escrow action completed successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Error in admin escrow action:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
