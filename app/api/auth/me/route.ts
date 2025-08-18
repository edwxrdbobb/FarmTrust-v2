import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/services/auth_service";
import * as userService from "@/services/auth_service";
import { connectDB } from "@/lib/db";

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
    
    // Return user data
    return NextResponse.json({
      message: "Authenticated",
      user: {
        _id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        phone: result.user.phone,
        verified: result.user.verified,
        image: result.user.image,
        premium_status: result.user.premium_status,
        department: result.user.department,
        permissions: result.user.permissions || [],
        lastLogin: result.user.lastLogin,
        createdAt: result.user.createdAt,
        isActive: result.user.isActive !== false,
      },
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    // Get token from cookies
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "No authentication token found" },
        { status: 401 }
      );
    }
    
    // Verify token and get user
    const result = await authService.isTokenValid(token);
    
    if (!result.success || !result.user) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }
    
    // Get update data from request body
    const updateData = await request.json();
    const { name, email, phone, department } = updateData;
    
    // Update user profile
    const updateResult = await userService.updateUserProfile(result.user.id, {
      name,
      email,
      phone,
      department
    });
    
    if (!updateResult.success) {
      return NextResponse.json(
        { message: updateResult.error || "Failed to update profile" },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: "Profile updated successfully",
      user: updateResult.user,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}