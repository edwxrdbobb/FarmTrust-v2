import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/services/auth_service";
import * as farmerRequestService from "@/services/farmer_request_service";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "No authentication token found" },
        { status: 401 }
      );
    }
    
    // Verify token and get user
    const authResult = await authService.isTokenValid(token);
    
    if (!authResult.success) {
      return NextResponse.json(
        { message: authResult.error || "Invalid token" },
        { status: 401 }
      );
    }
    
    if (!authResult.user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 }
      );
    }

    // Get farmer request for the current user
    const farmerRequestResult = await farmerRequestService.getFarmerRequestByUserId(authResult.user.id);
    
    if (!farmerRequestResult.success) {
      return NextResponse.json(
        { message: "Farmer request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Farmer request found",
      farmerRequest: farmerRequestResult.data
    });

  } catch (error) {
    console.error("Get my farmer request API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
