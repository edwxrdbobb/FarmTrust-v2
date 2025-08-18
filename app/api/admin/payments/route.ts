import { NextRequest, NextResponse } from 'next/server';
import { paymentProcessor } from '@/services/payment_processor_service';
import { verifyToken } from '@/lib/jwt-utils';

export async function GET(request: NextRequest) {
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

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');

    // Get all payments (admin can see all)
    const result = await paymentProcessor.getAllPayments({
      page,
      limit,
      status: status as any,
      paymentMethod: paymentMethod as any
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payments: result.data,
      pagination: {
        page,
        limit,
        hasMore: result.data && result.data.length === limit
      }
    });

  } catch (error) {
    console.error('Error fetching admin payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 