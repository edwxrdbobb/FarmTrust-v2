import { NextRequest, NextResponse } from "next/server";
import { monimeService } from "@/services/monime_service";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get('x-monime-signature') || '';
    
    // Verify webhook signature for security
    if (!monimeService.validateWebhookSignature(rawBody, signature)) {
      console.error('Invalid webhook signature from Monime');
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }
    
    const webhookData = JSON.parse(rawBody);
    
    // Extract payment information from webhook
    const {
      event,
      data: {
        payment_id,
        reference,
        status,
        amount,
        currency,
        transaction_id,
        metadata
      }
    } = webhookData;
    
    console.log(`Monime webhook received: ${event} for payment ${payment_id}`);
    
    await connectDB();
    
    // Find the order by payment reference
    const order = await Order.findOne({
      'payment.reference': reference
    });
    
    if (!order) {
      console.error(`Order not found for payment reference: ${reference}`);
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }
    
    // Update order based on payment status
    let orderUpdate: any = {
      'payment.status': status,
      'payment.transactionId': transaction_id,
      'payment.updatedAt': new Date()
    };
    
    switch (status) {
      case 'completed':
        orderUpdate.paymentStatus = 'completed';
        orderUpdate.status = 'confirmed'; // Move order to confirmed status
        orderUpdate.confirmedAt = new Date();
        console.log(`Payment completed for order ${order._id}`);
        break;
        
      case 'failed':
        orderUpdate.paymentStatus = 'failed';
        orderUpdate.status = 'payment_failed';
        console.log(`Payment failed for order ${order._id}`);
        break;
        
      case 'cancelled':
        orderUpdate.paymentStatus = 'cancelled';
        orderUpdate.status = 'cancelled';
        console.log(`Payment cancelled for order ${order._id}`);
        break;
        
      case 'processing':
        orderUpdate.paymentStatus = 'processing';
        console.log(`Payment processing for order ${order._id}`);
        break;
        
      default:
        orderUpdate.paymentStatus = 'pending';
        console.log(`Payment status updated to ${status} for order ${order._id}`);
    }
    
    // Update the order in database
    await Order.findByIdAndUpdate(order._id, {
      $set: orderUpdate
    });
    
    // Send confirmation email or notification here if needed
    // await notificationService.sendPaymentStatusUpdate(order, status);
    
    return NextResponse.json(
      { 
        message: "Webhook processed successfully",
        order_id: order._id,
        payment_status: status
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Monime webhook processing error:", error);
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: "Monime webhook endpoint is active" },
    { status: 200 }
  );
}
