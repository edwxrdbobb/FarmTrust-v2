import { NextRequest, NextResponse } from "next/server";
import * as analyticsService from "@/services/analytics_service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const event = searchParams.get('event');
    const userId = searchParams.get('userId');
    const vendorId = searchParams.get('vendorId');
    const productId = searchParams.get('productId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build filters object
    const filters: any = {};
    if (event) filters.event = event;
    if (userId) filters.userId = userId;
    if (vendorId) filters.vendorId = vendorId;
    if (productId) filters.productId = productId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    // Get analytics events
    const result = await analyticsService.getAnalyticsEvents(filters, page, limit);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Analytics events retrieved successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Analytics Events API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}