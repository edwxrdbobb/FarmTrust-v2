import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/services/auth_service";

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // Basic validation
    const requiredFields = ["email", "password", "name", "role"];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = ["buyer", "vendor", "admin"];
    if (!validRoles.includes(userData.role)) {
      return NextResponse.json(
        { message: "Invalid role. Must be one of: buyer, vendor, admin" },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }
    
    // Delegate to service layer
    const result = await authService.registerUser(userData);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }
    
    if (!result.user || !result.token) {
      return NextResponse.json(
        { message: "User creation failed" },
        { status: 500 }
      );
    }
    
    // Create response with JWT token in HTTP-only cookie
    const response = NextResponse.json({
      message: "Registration successful",
      user: {
        id: result.user._id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
    });
    
    // Set JWT token as HTTP-only cookie
    response.cookies.set("auth_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      domain: process.env.NODE_ENV === "development" ? "localhost" : undefined,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    
    return response;
  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}