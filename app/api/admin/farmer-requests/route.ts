import { NextRequest, NextResponse } from "next/server";
import * as farmerRequestRepo from "@/repositories/farmer_request_repo";
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
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    await connectDB();

    // Build filters
    const filters: any = {};
    if (status && status !== "all") {
      filters.status = status;
    }
    if (priority && priority !== "all") {
      filters.priority = priority;
    }

    // Get farmer requests with pagination
    const skip = (page - 1) * limit;
    const requests = await farmerRequestRepo.getFarmerRequests(filters, {
      sort: { createdAt: -1 },
      limit,
      skip
    });
    const totalRequests = await farmerRequestRepo.countFarmerRequests(filters);

    // Transform farmer request data for admin view
    const transformedRequests = requests.map((request: any) => ({
      id: request._id,
      farmerName: request.userId?.name || 'Unknown Farmer',
      farmerEmail: request.userId?.email || 'N/A',
      farmName: request.farmName,
      farmLocation: request.farmLocation,
      farmSize: request.farmSize,
      crops: request.crops,
      experience: request.experience,
      status: request.status,
      priority: request.priority,
      reason: request.reason,
      adminNotes: request.adminNotes,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    }));

    return NextResponse.json({
      message: "Farmer requests retrieved successfully",
      requests: transformedRequests,
      pagination: {
        page,
        limit,
        total: totalRequests,
        totalPages: Math.ceil(totalRequests / limit)
      },
    });
  } catch (error) {
    console.error("Admin Farmer Requests API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}