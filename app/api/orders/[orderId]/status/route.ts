import { NextRequest, NextResponse } from "next/server";
import * as orderService from "@/services/order_service";
import * as authService from "@/services/auth_service";

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  const isValid = await authService.isTokenValid(token);
  if (!isValid.success) return null;
  
  return isValid.user;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // Check authentication
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { orderId } = params;
    const { status, note } = await request.json();

    // Validate status
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Invalid order status" },
        { status: 400 }
      );
    }

    // Check if user has permission to update this order
    const order = await orderService.getOrderById(orderId);
    if (!order.success) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Only vendors can update their own orders, or admins can update any order
    if (user.role === "vendor") {
      const isVendorOrder = order.order.items.some((item: any) => 
        item.product.vendor.toString() === user.id
      );
      
      if (!isVendorOrder) {
        return NextResponse.json(
          { message: "You can only update orders for your own products" },
          { status: 403 }
        );
      }
    } else if (user.role !== "admin") {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Update order status
    const result = await orderService.updateOrderStatus(orderId, status, note, user.id);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Order status updated successfully",
      order: result.order,
    });
  } catch (error) {
    console.error("Update Order Status API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 