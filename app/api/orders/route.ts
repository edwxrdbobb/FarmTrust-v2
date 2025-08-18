import { NextRequest, NextResponse } from "next/server";
import * as orderService from "@/services/order_service";
import * as authService from "@/services/auth_service";
import * as vendorService from "@/services/vendor_service";

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  
  const tokenValidation = await authService.isTokenValid(token);
  if (!tokenValidation.success || !tokenValidation.user) return null;
  
  return tokenValidation.user;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    
    let result;
    
    if (user.role === "vendor") {
      // Get vendor profile first to get vendor ID
      const vendorResult = await vendorService.getVendorByUserId(user.id);
      if (!vendorResult.success) {
        return NextResponse.json(
          { message: "Vendor profile not found" },
          { status: 404 }
        );
      }
      
      // Get orders for vendor using vendor ID
      result = await orderService.getVendorOrders(vendorResult.data._id, page, limit);
    } else {
      // Get orders for user (buyer)
      result = await orderService.getUserOrders(user.id, page, limit);
    }
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: "Orders retrieved successfully",
      orders: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get Orders API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Only buyers can create orders (users without vendor role can create orders)
    if (user.role === "vendor") {
      return NextResponse.json(
        { message: "Vendors cannot create orders as buyers" },
        { status: 403 }
      );
    }
    
    const orderData = await request.json();
    
    // Basic validation
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { message: "Order must contain at least one item" },
        { status: 400 }
      );
    }
    
    if (!orderData.delivery) {
      return NextResponse.json(
        { message: "Delivery information is required" },
        { status: 400 }
      );
    }
    
    if (!orderData.payment) {
      return NextResponse.json(
        { message: "Payment information is required" },
        { status: 400 }
      );
    }
    
    // Validate delivery information required fields
    const requiredDeliveryFields = ["firstName", "lastName", "phone", "address", "district"];
    const missingDeliveryFields = requiredDeliveryFields.filter(
      field => !orderData.delivery[field] || orderData.delivery[field].trim() === ""
    );
    
    if (missingDeliveryFields.length > 0) {
      return NextResponse.json(
        { message: `Missing delivery fields: ${missingDeliveryFields.join(", ")}` },
        { status: 400 }
      );
    }
    
    // Auto-set city to "Freetown" if district is "Western Area Urban" and city is missing
    if (orderData.delivery.district === "Western Area Urban" && (!orderData.delivery.city || orderData.delivery.city.trim() === "")) {
      orderData.delivery.city = "Freetown";
    }
    
    // Normalize and trim strings
    orderData.delivery.district = orderData.delivery.district.trim();
    if (orderData.delivery.city) {
      orderData.delivery.city = orderData.delivery.city.trim();
    }
    
    // Validate order items
    for (const item of orderData.items) {
      if (!item.productId || !item.quantity || !item.price) {
        return NextResponse.json(
          { message: "Each order item must have productId, quantity, and price" },
          { status: 400 }
        );
      }
      
      if (item.quantity <= 0 || item.price <= 0) {
        return NextResponse.json(
          { message: "Quantity and price must be positive numbers" },
          { status: 400 }
        );
      }
    }
    
    // Transform data for service layer
    const transformedOrderData = {
      buyer: user.id,
      items: orderData.items,
      deliveryAddress: {
        firstName: orderData.delivery.firstName,
        lastName: orderData.delivery.lastName,
        phone: orderData.delivery.phone,
        address: orderData.delivery.address,
        city: orderData.delivery.city || "",
        district: orderData.delivery.district,
        notes: orderData.delivery.notes || "",
      },
      paymentMethod: orderData.payment.method,
      paymentDetails: {
        phone: orderData.payment.phone || "",
      },
      total: orderData.total,
      currency: "SLL", // Sierra Leonean Leone
    };
    
    // Delegate to service layer
    const result = await orderService.createOrder(user.id, transformedOrderData);
    
    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: "Order created successfully",
      order: result.order,
    }, { status: 201 });
  } catch (error) {
    console.error("Create Order API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}