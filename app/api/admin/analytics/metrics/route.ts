import { NextRequest, NextResponse } from "next/server";
import * as analyticsService from "@/services/analytics_service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // sales, users, products, vendors
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const vendorId = searchParams.get('vendorId'); // optional filter
    const userId = searchParams.get('userId');

    // Basic validation
    if (!type || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Type, start date, and end date are required" },
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

    let result;
    
    switch (type) {
      case 'sales':
        result = await analyticsService.getSalesMetrics(dateRange, vendorId || undefined);
        break;
      case 'users':
        result = await analyticsService.getUserMetrics(dateRange);
        break;
      case 'products':
        result = await analyticsService.getProductMetrics(dateRange, vendorId || undefined);
        break;
      case 'vendors':
        result = await analyticsService.getVendorMetrics(dateRange);
        break;
      case 'conversion':
        result = await analyticsService.getConversionMetrics(dateRange, vendorId || undefined);
        break;
      default:
        return NextResponse.json(
          { message: "Invalid metrics type. Use: sales, users, products, vendors, or conversion" },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${type} metrics retrieved successfully`,
      data: result.data,
    });
  } catch (error) {
    console.error("Analytics Metrics API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}