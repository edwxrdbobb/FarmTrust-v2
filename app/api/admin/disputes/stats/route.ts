import { NextRequest, NextResponse } from "next/server";
import * as disputeService from "@/services/dispute_service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Get dispute statistics with admin validation
    const result = await disputeService.getDisputeStats(adminId);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: result.error?.includes("Unauthorized") ? 403 : 500 }
      );
    }

    return NextResponse.json({
      message: "Dispute statistics retrieved successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Admin Dispute Stats API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}