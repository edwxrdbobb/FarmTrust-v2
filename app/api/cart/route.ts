import { NextRequest, NextResponse } from "next/server";
import * as cartService from "@/services/cart_service";
import { isTokenValid } from "@/services/auth_service";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const tokenValidation = await isTokenValid(token);
    if (!tokenValidation.success || !tokenValidation.user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const result = await cartService.getCart(tokenValidation.user.id);
    
    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      cart: result.data
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const tokenValidation = await isTokenValid(token);
    if (!tokenValidation.success || !tokenValidation.user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    const result = await cartService.addToCart(tokenValidation.user.id, { productId, quantity });
    
    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cart: result.data
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const tokenValidation = await isTokenValid(token);
    if (!tokenValidation.success || !tokenValidation.user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json({ message: "Product ID and quantity are required" }, { status: 400 });
    }

    const result = await cartService.updateCartItem(tokenValidation.user.id, productId, { quantity });
    
    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Cart updated",
      cart: result.data
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("DELETE /api/cart - Starting cart item removal");
    
    const token = request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      console.log("DELETE /api/cart - No authentication token provided");
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }

    const tokenValidation = await isTokenValid(token);
    if (!tokenValidation.success || !tokenValidation.user) {
      console.log("DELETE /api/cart - Invalid token validation:", tokenValidation);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    console.log("DELETE /api/cart - User authenticated:", { userId: tokenValidation.user.id });

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    console.log("DELETE /api/cart - Request details:", {
      url: request.url,
      productId,
      userId: tokenValidation.user.id
    });

    if (!productId) {
      console.log("DELETE /api/cart - Missing productId parameter");
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    console.log("DELETE /api/cart - Calling cartService.removeFromCart");
    const result = await cartService.removeFromCart(tokenValidation.user.id, productId);
    
    console.log("DELETE /api/cart - Service result:", result);
    
    if (!result.success) {
      console.error("DELETE /api/cart - Service failed:", result.error);
      return NextResponse.json({ message: result.error || "Failed to remove item from cart" }, { status: 400 });
    }

    console.log("DELETE /api/cart - Success, returning response");
    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
      cart: result.data
    });
  } catch (error) {
    console.error("DELETE /api/cart - Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
