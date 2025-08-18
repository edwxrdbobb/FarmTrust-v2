import { NextRequest, NextResponse } from "next/server"
import * as userService from "@/services/auth_service"
import * as authService from "@/services/auth_service"
import { connectDB } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Get user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      )
    }

    const authResult = await authService.isTokenValid(token)
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      )
    }

    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      )
    }

    // Send verification email
    const result = await userService.sendVerificationEmail(authResult.user.id, email)
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error || "Failed to send verification email" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Verification email sent successfully",
      data: { 
        verificationUrl: result.verificationUrl // For development/testing
      }
    })
  } catch (error) {
    console.error("Error sending verification email:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
