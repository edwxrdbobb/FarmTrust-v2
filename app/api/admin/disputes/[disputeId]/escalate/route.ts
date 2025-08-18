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
    const { escalationReason } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    if (!escalationReason) {
      return NextResponse.json(
        { message: "Escalation reason is required" },
        { status: 400 }
      );
    }

    // Escalate dispute
    const result = await disputeService.escalateDispute(
      disputeId,
      adminId,
      escalationReason
    );

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: result.error?.includes("not found") ? 404 : 
                  result.error?.includes("Unauthorized") ? 403 : 500 }
      );
    }

    return NextResponse.json({
      message: "Dispute escalated successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Admin Dispute Escalate API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}