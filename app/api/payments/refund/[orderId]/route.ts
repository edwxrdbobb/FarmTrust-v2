import { NextRequest, NextResponse } from 'next/server';
import * as escrowService from '@/services/escrow_service';
import { verifyToken } from '@/lib/jwt-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    const { orderId } = params;
    const body = await request.json();
    const { refundReason, refundAmount } = body;

    if (!refundReason) {
      return NextResponse.json(
        { error: 'Refund reason is required' },
        { status: 400 }
      );
    }

    // Get escrow for this order
    const escrowResult = await escrowService.getEscrowByOrder(orderId);
    if (!escrowResult.success) {
      return NextResponse.json(
        { error: 'Escrow not found for this order' },
        { status: 404 }
      );
    }

    const escrow = escrowResult.data;

    // Check if user is authorized to refund escrow
    const isAuthorized = 
      decoded.userId === escrow.buyerId.toString() ||
      decoded.userId === escrow.vendorId.toString() ||
      decoded.role === 'admin';

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized to refund escrow for this order' },
        { status: 403 }
      );
    }

    // Refund escrow
    const result = await escrowService.refundEscrow({
      escrowId: escrow._id.toString(),
      refundAmount: refundAmount || escrow.amount,
      refundReason
    }, decoded.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Escrow refunded successfully',
      data: {
        escrowId: escrow._id,
        orderId: orderId,
        refundedAmount: result.data?.refundedAmount,
        refundedAt: result.data?.refundedAt
      }
    });

  } catch (error) {
    console.error('Error refunding escrow:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 