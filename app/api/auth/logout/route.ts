import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/services/auth_service";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "No authentication token found" },
        { status: 400 }
      );
    }
    
    // Delegate to service layer to invalidate token
    const result = await authService.invalidateToken(token);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }
    
    // Create response and clear the auth cookie
    const response = NextResponse.json({
      message: "Logout successful",
    });
    
    // Clear the auth token cookie
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });
    
    return response;
  } catch (error) {
    console.error("Logout API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}