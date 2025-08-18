import { NextRequest, NextResponse } from "next/server";
import * as orderService from "@/services/order_service";
import * as userService from "@/services/auth_service";
import { connectDB } from "@/lib/db";

async function getBuyerFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  const isValid = await userService.isTokenValid(token);
  if (!isValid.success || !isValid.user) return null;
  
  return isValid.user;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const buyer = await getBuyerFromToken(request);
    if (!buyer) {
      return NextResponse.json(
        { message: "Unauthorized - Login required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { orderId } = await params

    const result = await orderService.confirmOrderDelivery(orderId, buyer._id.toString());

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Delivery confirmed successfully. Payment has been released to the vendor.",
      data: result.data
    });
  } catch (error) {
    console.error("Error confirming delivery:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
