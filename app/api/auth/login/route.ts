import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/services/auth_service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }
    
    // Delegate to service layer
    const result = await authService.loginUser({ email, password });
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 401 }
      );
    }
    
    if (!result.user || !result.token) {
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 500 }
      );
    }
    
    // Create response with JWT token in HTTP-only cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: result.user._id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        phone: result.user.phone,
        verified: result.user.verified,
        image: result.user.image,
        premium_status: result.user.premium_status,
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
    console.error("Login API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}