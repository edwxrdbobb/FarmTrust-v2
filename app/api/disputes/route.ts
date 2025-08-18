import { NextRequest, NextResponse } from 'next/server';
import * as disputeService from '@/services/dispute_service';
import { verifyJWT } from '@/lib/jwt-utils';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, type, reason, description, evidence, requestedResolution, requestedAmount } = body;

    // Validate required fields
    if (!orderId || !type || !reason || !description || !requestedResolution) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await disputeService.createDispute(decoded.userId, {
      order: orderId,
      type,
      reason,
      description,
      evidence: evidence || [],
      requestedResolution,
      requestedAmount
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user disputes
    const result = await disputeService.getUserDisputes(decoded.userId, page, limit);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 