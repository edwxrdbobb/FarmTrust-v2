import { NextRequest, NextResponse } from "next/server";
import * as analyticsService from "@/services/analytics_service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId');

    // Basic validation
    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "Start date and end date are required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required for admin access" },
        { status: 400 }
      );
    }

    const dateRange = {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    };

    // Get dashboard metrics (includes admin role validation)
    const result = await analyticsService.getDashboardMetrics(userId, dateRange);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: result.error?.includes("Unauthorized") ? 403 : 500 }
      );
    }

    return NextResponse.json({
      message: "Analytics data retrieved successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { event, userId, vendorId, productId, orderId, category, value, metadata } = data;

    // Basic validation
    if (!event) {
      return NextResponse.json(
        { message: "Event type is required" },
        { status: 400 }
      );
    }

    // Track analytics event
    const result = await analyticsService.trackEvent({
      event,
      userId,
      vendorId,
      productId,
      orderId,
      category,
      value,
      metadata
    });

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Event tracked successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Analytics Tracking Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}