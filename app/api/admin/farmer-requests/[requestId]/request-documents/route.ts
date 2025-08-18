import { NextRequest, NextResponse } from "next/server";
import * as farmerRequestService from "@/services/farmer_request_service";

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const { requestId } = params;
    const { requiredDocuments, notes } = await request.json();

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    if (!requiredDocuments || !Array.isArray(requiredDocuments) || requiredDocuments.length === 0) {
      return NextResponse.json(
        { message: "Required documents array is required" },
        { status: 400 }
      );
    }

    if (!notes) {
      return NextResponse.json(
        { message: "Notes explaining the required documents are required" },
        { status: 400 }
      );
    }

    // Request additional documents
    const result = await farmerRequestService.requestAdditionalDocuments(
      requestId,
      adminId,
      requiredDocuments,
      notes
    );

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: result.error?.includes("not found") ? 404 : 
                  result.error?.includes("Unauthorized") ? 403 : 500 }
      );
    }

    return NextResponse.json({
      message: "Additional documents requested successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Admin Request Documents API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}