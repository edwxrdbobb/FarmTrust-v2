import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/services/auth_service";
import * as vendorService from "@/services/vendor_service";

export async function POST(request: NextRequest) {
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

    // Check if user already has vendor role
    if (authResult.user.role !== 'vendor') {
      return NextResponse.json(
        { message: "User must have vendor role to create vendor profile" },
        { status: 403 }
      );
    }

    // Check if vendor profile already exists
    const existingVendor = await vendorService.getVendorByUserId(authResult.user.id);
    if (existingVendor.success) {
      return NextResponse.json(
        { message: "Vendor profile already exists", vendor: existingVendor.data },
        { status: 200 }
      );
    }

    const vendorData = await request.json();
    
    // Basic validation
    const requiredFields = ["farmName", "description", "location", "farmerType"];
    const missingFields = requiredFields.filter(field => !vendorData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate farmer type
    const validFarmerTypes = ["organic", "waste-to-resource", "fish", "cattle"];
    if (!validFarmerTypes.includes(vendorData.farmerType)) {
      return NextResponse.json(
        { message: "Invalid farmer type. Must be one of: " + validFarmerTypes.join(", ") },
        { status: 400 }
      );
    }

    // Create vendor profile
    const createVendorData = {
      farmName: vendorData.farmName,
      farmerType: vendorData.farmerType,
      description: vendorData.description,
      location: vendorData.location,
      // Additional fields that the service might expect
      businessName: vendorData.farmName,
      businessType: vendorData.farmerType,
      address: {
        street: vendorData.location,
        city: vendorData.city || "Unknown",
        state: vendorData.district || "Unknown", 
        zipCode: "00000",
        country: "Sierra Leone"
      },
      contactInfo: {
        phone: vendorData.phone || authResult.user.phone || "",
        email: authResult.user.email,
        website: vendorData.website || null
      }
    };

    const result = await vendorService.createVendor(authResult.user.id, createVendorData);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error || "Failed to create vendor profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Vendor profile created successfully",
      vendor: result.data
    }, { status: 201 });

  } catch (error) {
    console.error("Vendor registration API error:", error);
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

    // Get vendor profile if it exists
    const vendorResult = await vendorService.getVendorByUserId(authResult.user.id);
    
    if (!vendorResult.success) {
      return NextResponse.json(
        { message: "Vendor profile not found", hasProfile: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Vendor profile found",
      vendor: vendorResult.data,
      hasProfile: true
    });

  } catch (error) {
    console.error("Get vendor profile API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}