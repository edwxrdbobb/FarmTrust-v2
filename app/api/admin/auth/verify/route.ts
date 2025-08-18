import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/user_model";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "No admin token found" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN || 'fallback-secret') as any;

    // Check if token is for admin access
    if (decoded.type !== 'admin' || (decoded.role !== 'Admin' && decoded.role !== 'SuperAdmin')) {
      return NextResponse.json(
        { message: "Invalid admin token" },
        { status: 401 }
      );
    }

    // Connect to database and get user details
    await connectDB();
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify user is still an admin
    if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { message: "User is no longer an admin" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: "Token verified successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}