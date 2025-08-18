import { NextRequest, NextResponse } from "next/server";
import * as disputeService from "@/services/dispute_service";

export async function POST(
  request: NextRequest,
  { params }: { params: { disputeId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { disputeId } = params;
    const { closureReason } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    if (!closureReason) {
      return NextResponse.json(
        { message: "Closure reason is required" },
        { status: 400 }
      );
    }

    // Close dispute
    const result = await disputeService.closeDispute(
      disputeId,
      adminId,
      closureReason
    );

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: result.error?.includes("not found") ? 404 : 
                  result.error?.includes("Unauthorized") ? 403 : 500 }
      );
    }

    return NextResponse.json({
      message: "Dispute closed successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Admin Dispute Close API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}