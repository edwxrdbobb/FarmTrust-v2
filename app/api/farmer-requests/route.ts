import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/services/auth_service";
import * as farmerRequestService from "@/services/farmer_request_service";

export async function POST(request: NextRequest) {
  try {
    // Get token from cookies or Authorization header
    const token = request.cookies.get("auth_token")?.value || 
                  request.headers.get("Authorization")?.replace("Bearer ", "");
    
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

    const requestData = await request.json();
    
    // Basic validation
    const requiredFields = ["farmName", "description", "location", "farmerType"];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Create farmer request
    const createRequestData = {
      farmName: requestData.farmName,
      description: requestData.description,
      location: requestData.location,
      farmerType: requestData.farmerType,
      documents: requestData.documents || [],
      contactPhone: requestData.contactPhone,
      yearsOfExperience: requestData.yearsOfExperience || 0,
      farmSize: requestData.farmSize || { value: 0, unit: "acres" }
    };

    const result = await farmerRequestService.createFarmerRequest(authResult.user.id, createRequestData);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error || "Failed to create farmer request" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Farmer request created successfully",
      data: result.data
    }, { status: 201 });

  } catch (error) {
    console.error("Farmer request creation API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const farmerType = searchParams.get("farmerType");

    // Build filters
    const filters: any = {};
    if (status) filters.status = status;
    if (farmerType) filters.farmerType = farmerType;

    // Get farmer requests
    const result = await farmerRequestService.getFarmerRequests(filters, page, limit);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error || "Failed to fetch farmer requests" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Farmer requests retrieved successfully",
      data: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error("Get farmer requests API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
