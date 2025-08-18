import { NextRequest, NextResponse } from "next/server";
import * as cartService from "@/services/cart_service";
import { isTokenValid } from "@/services/auth_service";

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const tokenValidation = await isTokenValid(token);
    if (!tokenValidation.success || !tokenValidation.user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const result = await cartService.clearCart(tokenValidation.user.id);
    
    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
      cart: result.data
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}