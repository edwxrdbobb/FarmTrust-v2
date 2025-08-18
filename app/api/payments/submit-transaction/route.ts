import { NextRequest, NextResponse } from 'next/server';
import { paymentProcessor } from '@/services/payment_processor_service';
import { verifyToken } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { transactionId, orderId, amount, paymentMethod, phoneNumber } = body;

    // Validate required fields
    if (!transactionId || !orderId || !amount || !paymentMethod || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: transactionId, orderId, amount, paymentMethod, phoneNumber' },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!['orange_money', 'afrimoney'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method. Must be orange_money or afrimoney' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Submit transaction for verification
    const result = await paymentProcessor.submitTransaction({
      transactionId,
      orderId,
      buyerId: decoded.userId,
      amount,
      paymentMethod,
      phoneNumber
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment transaction submitted successfully',
      data: {
        transactionId: result.data?.transactionId,
        status: result.data?.status,
        merchantCode: result.data?.merchantCode
      }
    });

  } catch (error) {
    console.error('Error submitting payment transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 