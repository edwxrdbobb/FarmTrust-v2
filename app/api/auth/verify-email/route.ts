import { NextRequest, NextResponse } from "next/server"
import * as userService from "@/services/auth_service"
import { connectDB } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json(
        { message: "Verification token is required" },
        { status: 400 }
      )
    }

    // Verify the email token
    const result = await userService.verifyEmailToken(token)
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error || "Invalid or expired verification token" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "Email verified successfully",
      data: { user: result.user }
    })
  } catch (error) {
    console.error("Error in email verification:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json(
        { message: "Verification token is required" },
        { status: 400 }
      )
    }

    await connectDB()
    
    // Verify the email token
    const result = await userService.verifyEmailToken(token)
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error || "Invalid or expired verification token" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: "Email verified successfully",
      data: { user: result.user }
    })
  } catch (error) {
    console.error("Error in email verification:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
