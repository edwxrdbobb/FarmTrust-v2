import { NextRequest, NextResponse } from "next/server";
import * as farmerRequestService from "@/services/farmer_request_service";

export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { requestId } = params;

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Get farmer request with admin validation
    const result = await farmerRequestService.getFarmerRequestById(requestId, adminId);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: result.error?.includes("not found") ? 404 : 
                  result.error?.includes("Unauthorized") ? 403 : 500 }
      );
    }

    return NextResponse.json({
      message: "Farmer request retrieved successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Admin Farmer Request Get API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { requestId } = params;
    const updateData = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Update farmer request status
    const result = await farmerRequestService.updateFarmerRequestStatus(
      requestId,
      adminId,
      updateData
    );

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: result.error?.includes("not found") ? 404 : 
                  result.error?.includes("Unauthorized") ? 403 : 500 }
      );
    }

    return NextResponse.json({
      message: "Farmer request updated successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Admin Farmer Request Update API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { requestId } = params;

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Delete farmer request (admin can delete any request)
    const result = await farmerRequestService.deleteFarmerRequest(requestId, adminId);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: result.error?.includes("not found") ? 404 : 
                  result.error?.includes("Unauthorized") ? 403 : 500 }
      );
    }

    return NextResponse.json({
      message: result.message
    });
  } catch (error) {
    console.error("Admin Farmer Request Delete API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}