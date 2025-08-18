import { NextRequest, NextResponse } from "next/server";
import * as orderService from "@/services/order_service";
import * as userService from "@/services/auth_service";
import { connectDB } from "@/lib/db";

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  const isValid = await userService.isTokenValid(token);
  if (!isValid.success || !isValid.user) return null;
  
  return isValid.user;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized - Login required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { orderId } = await params

    const result = await orderService.getEscrowStatus(orderId, user._id.toString());

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Escrow status retrieved successfully",
      data: result.data
    });
  } catch (error) {
    console.error("Error getting escrow status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
