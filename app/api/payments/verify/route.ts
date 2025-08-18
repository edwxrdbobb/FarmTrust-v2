import { NextRequest, NextResponse } from 'next/server';
import { paymentProcessor } from '@/services/payment_processor_service';
import { verifyToken } from '@/lib/jwt-utils';
import * as authService from "@/services/auth_service";
import { monimeService } from "@/services/monime_service";
import { connectDB } from "@/lib/db";
import Order from "@/models/order_model";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (admin only for manual verification)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin for manual verification
    const isAdmin = decoded.role === 'admin';
    
    const body = await request.json();
    const { transactionId, adminNotes } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    let result;
    if (isAdmin && adminNotes) {
      // Manual verification by admin
      result = await paymentProcessor.manualVerification(transactionId, decoded.userId, adminNotes);
    } else {
      // Automatic verification
      result = await paymentProcessor.verifyPayment(transactionId);
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: {
        status: result.status,
        transactionId: result.transactionId,
        amount: result.amount,
        fee: result.fee,
        timestamp: result.timestamp
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  
  const isValid = await authService.isTokenValid(token);
  if (!isValid.success) return null;
  
  return isValid.user;
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

    // Get payment reference from query parameters
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.json(
        { message: "Payment reference is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the order by payment reference
    const order = await Order.findOne({
      'payment.reference': reference,
      buyerId: user.id
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // If Monime is configured, verify with Monime API
    if (monimeService.isConfigured()) {
      try {
        const verificationResult = await monimeService.verifyPayment(reference);
        
        if (verificationResult.success && verificationResult.data) {
          // Update local order status if needed
          const remoteStatus = verificationResult.data.status;
          
          if (order.payment.status !== remoteStatus) {
            await Order.findByIdAndUpdate(order._id, {
              $set: {
                'payment.status': remoteStatus,
                'payment.updatedAt': new Date(),
                // Update overall payment and order status based on remote status
                ...(remoteStatus === 'completed' && {
                  paymentStatus: 'completed',
                  status: 'confirmed',
                  'payment.completedAt': new Date()
                }),
                ...(remoteStatus === 'failed' && {
                  paymentStatus: 'failed',
                  status: 'payment_failed'
                }),
                ...(remoteStatus === 'cancelled' && {
                  paymentStatus: 'cancelled',
                  status: 'cancelled'
                }),
                ...(remoteStatus === 'processing' && {
                  paymentStatus: 'processing'
                })
              }
            });
            
            // Refresh order data
            const updatedOrder = await Order.findById(order._id);
            
            return NextResponse.json({
              message: "Payment status verified",
              payment: {
                reference: updatedOrder.payment.reference,
                status: updatedOrder.payment.status,
                paymentId: updatedOrder.payment.paymentId,
                amount: updatedOrder.payment.amount,
                currency: updatedOrder.payment.currency,
                updatedAt: updatedOrder.payment.updatedAt
              },
              order: {
                id: updatedOrder._id,
                status: updatedOrder.status,
                paymentStatus: updatedOrder.paymentStatus
              }
            });
          }
        }
      } catch (error) {
        console.error('Monime verification error:', error);
        // Continue with local status if Monime verification fails
      }
    }

    // Return current local status
    return NextResponse.json({
      message: "Payment status retrieved",
      payment: {
        reference: order.payment.reference,
        status: order.payment.status,
        paymentId: order.payment.paymentId,
        amount: order.payment.amount,
        currency: order.payment.currency,
        updatedAt: order.payment.updatedAt
      },
      order: {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus
      }
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
