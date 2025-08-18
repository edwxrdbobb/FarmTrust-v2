import { NextRequest, NextResponse } from 'next/server';
import * as reviewService from '@/services/review_service';
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
    const { productId, vendorId, orderId, rating, title, content, images } = body;

    // Validate required fields
    if (!orderId || !rating || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const result = await reviewService.createReview(decoded.userId, {
      product: productId,
      vendor: vendorId,
      order: orderId,
      rating,
      title: title || '',
      comment: content,
      images: images || []
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const vendorId = searchParams.get('vendorId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let result;
    if (productId) {
      result = await reviewService.getReviewsByProductId(productId, page, limit);
    } else if (vendorId) {
      result = await reviewService.getReviewsByVendorId(vendorId, page, limit);
    } else if (userId) {
      result = await reviewService.getReviewsByUserId(userId, page, limit);
    } else {
      return NextResponse.json({ error: 'Missing required parameter' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 