import { NextRequest, NextResponse } from "next/server";
import * as vendorService from "@/services/vendor_service";
import * as authService from "@/services/auth_service";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token and get user
    const result = await authService.isTokenValid(token);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error || "Invalid token" },
        { status: 401 }
      );
    }
    
    if (!result.user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 }
      );
    }

    // Check if user is a vendor
    if (result.user.role !== "vendor") {
      return NextResponse.json(
        { message: "Access denied. Vendor role required." },
        { status: 403 }
      );
    }

    // Get vendor profile using vendor service
    const vendorResult = await vendorService.getVendorByUserId(result.user.id);
    
    if (!vendorResult.success) {
      return NextResponse.json(
        { 
          message: "Vendor profile not found. Please complete your vendor onboarding.",
          redirectTo: "/vendor/onboarding",
          needsOnboarding: true
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Vendor profile retrieved successfully",
      vendor: vendorResult.data,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}