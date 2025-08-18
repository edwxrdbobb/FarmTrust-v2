import { NextRequest, NextResponse } from "next/server";
import * as authService from "@/services/auth_service";
import { monimeService } from "@/services/monime_service";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  const isValid = await authService.isTokenValid(token);
  if (!isValid.success) return null;
  
  return isValid.user;
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

    // Check if Monime is configured
    if (!monimeService.isConfigured()) {
      const configStatus = monimeService.getConfigStatus();
      console.error('Monime not configured:', configStatus);
      return NextResponse.json(
        { 
          message: "Payment service not available",
          details: `Missing configuration: ${configStatus.missing.join(', ')}`
        },
        { status: 503 }
      );
    }

    const paymentData = await request.json();
    const { orderId, paymentMethod, phoneNumber, amount, customerInfo } = paymentData;

    // Validate required fields
    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { message: "Order ID and payment method are required" },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!['orange_money', 'afrimoney', 'africell_money'].includes(paymentMethod)) {
      return NextResponse.json(
        { message: "Invalid payment method. Only Orange Money, Afrimoney, and Africell Money are supported." },
        { status: 400 }
      );
    }

    // Validate phone number for mobile money
    if (!phoneNumber) {
      return NextResponse.json(
        { message: "Phone number is required for mobile money payments" },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^232[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { message: "Invalid phone number format. Please use Sierra Leone mobile number format." },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the order
    const order = await Order.findOne({
      _id: orderId,
      userId: user.id
    }).populate({
      path: 'items.product',
      select: 'name price images'
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order is already paid
    if (order.status === 'paid' || order.paymentStatus === 'completed') {
      return NextResponse.json(
        { message: "Order is already paid" },
        { status: 400 }
      );
    }

    // Check if there's already a pending payment
    if (order.payment && order.payment.status === 'pending') {
      return NextResponse.json(
        { message: "Payment already initiated for this order" },
        { status: 400 }
      );
    }

    // Generate payment reference
    const paymentReference = monimeService.generatePaymentReference(orderId);

    // Create payment description
    const itemCount = order.items.length;
    const description = `FarmTrust Order - ${itemCount} item${itemCount > 1 ? 's' : ''}`;

    // Prepare customer info
    const customer = {
      name: customerInfo?.name || `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim(),
      email: customerInfo?.email || order.shippingAddress?.email || 'customer@farmtrust.com',
      phone: phoneNumber,
    };

    // Initialize payment with Monime
    const paymentResult = await monimeService.createMobileMoneyPayment({
      amount: monimeService.formatAmount(order.total),
      phone: phoneNumber,
      provider: paymentMethod as 'orange_money' | 'afrimoney' | 'africell_money',
      reference: paymentReference,
      description,
      customer,
    });

    if (!paymentResult.success) {
      console.error('Monime payment initialization failed:', paymentResult.error);
      return NextResponse.json(
        { message: paymentResult.error || "Payment initialization failed" },
        { status: 400 }
      );
    }

    // Update order with payment information
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        'payment.reference': paymentReference,
        'payment.paymentId': paymentResult.data?.payment_id,
        'payment.provider': 'monime',
        'payment.method': paymentMethod,
        'payment.status': 'pending',
        'payment.initiatedAt': new Date(),
        'payment.amount': order.total,
        'payment.currency': 'SLE',
        'payment.customerPhone': phoneNumber,
        paymentStatus: 'pending',
      }
    });

    console.log(`Payment initialized for order ${orderId}:`, {
      reference: paymentReference,
      method: paymentMethod,
      amount: order.total,
      customer: customer.name
    });

    return NextResponse.json({
      message: "Payment initialized successfully",
      payment: {
        reference: paymentReference,
        paymentId: paymentResult.data?.payment_id,
        status: paymentResult.data?.status,
        checkoutUrl: paymentResult.data?.checkout_url,
        paymentUrl: paymentResult.data?.payment_url,
        expiresAt: paymentResult.data?.expires_at,
        transactionId: paymentResult.data?.transaction_id,
      }
    });

  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
