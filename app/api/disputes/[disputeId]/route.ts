import { NextRequest, NextResponse } from 'next/server';
import * as disputeService from '@/services/dispute_service';
import { verifyJWT } from '@/lib/jwt-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ disputeId: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { disputeId } = await params
    const result = await disputeService.getDisputeById(disputeId, decoded.userId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error fetching dispute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ disputeId: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { disputeId } = await params
    const body = await request.json();
    const { response, evidence } = body;

    if (!response) {
      return NextResponse.json({ error: 'Response is required' }, { status: 400 });
    }

    const result = await disputeService.respondToDispute(disputeId, decoded.userId, {
      response,
      evidence: evidence || []
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error responding to dispute:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 