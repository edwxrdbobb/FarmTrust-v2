import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/services/auth_service";
import jwt from "jsonwebtoken";

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

    // Authenticate user
    const result = await authService.loginUser({ email, password });

    if (!result.success) {
      return NextResponse.json(
        { message: result.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user has admin privileges
    const user = result.user;
    if (!user || (user.role !== "Admin" && user.role !== "SuperAdmin")) {
      return NextResponse.json(
        { message: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        type: "admin",
      },
      process.env.SECRET_ACCESS_TOKEN || "fallback-secret",
      { expiresIn: "8h" }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        image: user.image,
      },
      token,
    });

    // Set secure cookie
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
