import { NextRequest, NextResponse } from "next/server";
import * as disputeService from "@/services/dispute_service";

export async function GET(
  request: NextRequest,
  { params }: { params: { disputeId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { disputeId } = params;

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Get dispute with admin access
    const result = await disputeService.getDisputeById(disputeId, adminId);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: result.error?.includes("not found") ? 404 : 
                  result.error?.includes("Unauthorized") ? 403 : 500 }
      );
    }

    return NextResponse.json({
      message: "Dispute retrieved successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Admin Dispute Get API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { disputeId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { disputeId } = params;
    const updateData = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Update dispute status
    const result = await disputeService.updateDisputeStatus(
      disputeId,
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
      message: "Dispute updated successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Admin Dispute Update API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}