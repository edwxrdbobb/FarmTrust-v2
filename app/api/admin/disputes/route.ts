import { NextRequest, NextResponse } from "next/server";
import * as disputeService from "@/services/dispute_service";
import * as disputeRepo from "@/repositories/dispute_repo";
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
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    await connectDB();

    // Build filters
    const filters: any = {};
    if (status && status !== "all") {
      filters.status = status;
    }
    if (type && type !== "all") {
      filters.type = type;
    }
    if (priority && priority !== "all") {
      filters.priority = priority;
    }

    // Get disputes with pagination
    const skip = (page - 1) * limit;
    const disputes = await disputeRepo.getDisputes(filters, {
      sort: { createdAt: -1 },
      limit,
      skip
    });
    const totalDisputes = await disputeRepo.countDisputes(filters);

    // Transform dispute data for admin view
    const transformedDisputes = disputes.map((dispute: any) => ({
      id: dispute._id,
      orderNumber: dispute.orderId?.orderNumber || 'N/A',
      buyerName: dispute.buyerId?.name || 'Unknown Buyer',
      vendorName: dispute.vendorId?.name || 'Unknown Vendor',
      type: dispute.type,
      status: dispute.status,
      priority: dispute.priority,
      reason: dispute.reason,
      description: dispute.description,
      createdAt: dispute.createdAt,
      updatedAt: dispute.updatedAt,
      adminNotes: dispute.adminNotes,
      resolution: dispute.resolution,
      resolutionAmount: dispute.resolutionAmount
    }));

    return NextResponse.json({
      message: "Disputes retrieved successfully",
      disputes: transformedDisputes,
      pagination: {
        page,
        limit,
        total: totalDisputes,
        totalPages: Math.ceil(totalDisputes / limit)
      },
    });
  } catch (error) {
    console.error("Admin Disputes API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}