import * as reviewRepo from "@/repositories/review_repo";
import * as userRepo from "@/repositories/user_repo";
import * as productRepo from "@/repositories/product_repo";
import * as vendorRepo from "@/repositories/vendor_repo";
import * as orderRepo from "@/repositories/order_repo";
import * as vendorService from "./vendor_service";
import * as notificationService from "./notification_service";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

export interface CreateReviewData {
  product?: string;
  vendor?: string;
  order: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export enum ReviewType {
  PRODUCT = 'product',
  VENDOR = 'vendor'
}

export async function createReview(userId: string, reviewData: CreateReviewData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate user exists
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate order exists and belongs to user
    const order = await orderRepo.getOrderById(reviewData.order);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to review this order" };
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return { success: false, error: "Can only review delivered orders" };
    }

    // Validate rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    let reviewType: ReviewType;
    let targetId: string;

    if (reviewData.product) {
      // Product review
      const product = await productRepo.getProductById(reviewData.product);
      if (!product) {
        return { success: false, error: "Product not found" };
      }

      // Check if product is in the order
      const productInOrder = order.items.some(
        (item: any) => item.product.toString() === reviewData.product
      );
      if (!productInOrder) {
        return { success: false, error: "Product not found in this order" };
      }

      // Check if user already reviewed this product for this order
      const existingReview = await reviewRepo.getReviewByUserAndProduct(userId, reviewData.product);
      if (existingReview) {
        return { success: false, error: "You have already reviewed this product for this order" };
      }

      reviewType = ReviewType.PRODUCT;
      targetId = reviewData.product;
    } else if (reviewData.vendor) {
      // Vendor review
      const vendor = await vendorRepo.getVendorById(reviewData.vendor);
      if (!vendor) {
        return { success: false, error: "Vendor not found" };
      }

      // Check if user already reviewed this vendor for this order
      const existingReview = await reviewRepo.getReviewByUserAndVendor(userId, reviewData.vendor);
      if (existingReview) {
        return { success: false, error: "You have already reviewed this vendor for this order" };
      }

      reviewType = ReviewType.VENDOR;
      targetId = reviewData.vendor;
    } else {
      return { success: false, error: "Either product or vendor must be specified" };
    }

    // Create review
    const review = await reviewRepo.createReview({
      user: userId,
      product: reviewData.product,
      vendor: reviewData.vendor,
      order: reviewData.order,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: reviewData.images || [],
      type: reviewType,
      isVerified: true, // Since it's from a verified purchase
      createdAt: new Date(),
      updatedAt: new Date()
    }, { session });

    // Update product or vendor rating
    if (reviewType === ReviewType.PRODUCT) {
      await updateProductRating(reviewData.product!, reviewData.rating, session);
    } else {
      await vendorService.updateVendorRating(reviewData.vendor!, reviewData.rating, 1);
    }

    // Send notification to vendor
    if (reviewData.vendor) {
      const vendor = await vendorRepo.getVendorById(reviewData.vendor);
      if (vendor) {
        await notificationService.createNotification({
          userId: vendor.user,
          title: "New Review Received",
          message: `You received a ${reviewData.rating}-star review from ${user.firstName} ${user.lastName}`,
          type: "review",
          priority: "medium"
        });
      }
    }

    await commitTransaction(session);
    return { success: true, data: review };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error creating review:", error);
    return { success: false, error: "Failed to create review" };
  }
}

export async function getReviewById(reviewId: string) {
  try {
    await connectDB();
    const review = await reviewRepo.getReviewById(reviewId);
    
    if (!review) {
      return { success: false, error: "Review not found" };
    }

    return { success: true, data: review };
  } catch (error) {
    console.error("Error fetching review:", error);
    return { success: false, error: "Failed to fetch review" };
  }
}

export async function getReviewsByProductId(productId: string, page: number = 1, limit: number = 10, filters?: any) {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    const reviews = await reviewRepo.getReviewsByProductId(productId, { limit, skip, sort: { createdAt: -1 } });
    return { success: true, data: reviews };
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return { success: false, error: "Failed to fetch product reviews" };
  }
}

export async function getReviewsByUserId(userId: string, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    const reviews = await reviewRepo.getReviewsByUserId(userId, { limit, skip, sort: { createdAt: -1 } });
    return { success: true, data: reviews };
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return { success: false, error: "Failed to fetch user reviews" };
  }
}

export async function getReviewsByVendorId(vendorId: string, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    const reviews = await reviewRepo.getReviewsByVendorId(vendorId, { limit, skip, sort: { createdAt: -1 } });
    return { success: true, data: reviews };
  } catch (error) {
    console.error("Error fetching vendor reviews:", error);
    return { success: false, error: "Failed to fetch vendor reviews" };
  }
}

export async function updateReview(reviewId: string, userId: string, updateData: UpdateReviewData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const review = await reviewRepo.getReviewById(reviewId);
    if (!review) {
      return { success: false, error: "Review not found" };
    }

    // Check if user owns the review
    if (review.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to update this review" };
    }

    const updatedReview = await reviewRepo.updateReviewById(reviewId, {
      ...updateData,
      updatedAt: new Date()
    }, { session, new: true });

    await commitTransaction(session);
    return { success: true, data: updatedReview };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating review:", error);
    return { success: false, error: "Failed to update review" };
  }
}

export async function deleteReview(reviewId: string, userId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const review = await reviewRepo.getReviewById(reviewId);
    if (!review) {
      return { success: false, error: "Review not found" };
    }

    // Check if user owns the review or is admin
    const user = await userRepo.getUserById(userId);
    if (review.user.toString() !== userId && user?.role !== 'admin') {
      return { success: false, error: "Unauthorized to delete this review" };
    }

    const deleted = await reviewRepo.deleteReviewById(reviewId, { session });

    await commitTransaction(session);
    return { success: true, data: deleted };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error deleting review:", error);
    return { success: false, error: "Failed to delete review" };
  }
}

export async function flagReview(reviewId: string, userId: string, reason: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const review = await reviewRepo.getReviewById(reviewId);
    if (!review) {
      return { success: false, error: "Review not found" };
    }

    const updatedReview = await reviewRepo.updateReviewById(reviewId, {
      isFlagged: true,
      flaggedAt: new Date(),
      flaggedBy: userId,
      flagReason: reason,
      updatedAt: new Date()
    }, { session, new: true });

    // Send notification to admins
    await notificationService.createNotification({
      userId: "admin", // This should be handled differently for multiple admins
      title: "Review Flagged",
      message: `A review has been flagged for: ${reason}`,
      type: "review",
      priority: "medium"
    });

    await commitTransaction(session);
    return { success: true, data: updatedReview };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error flagging review:", error);
    return { success: false, error: "Failed to flag review" };
  }
}

export async function getProductReviewStats(productId: string) {
  try {
    await connectDB();
    const stats = await reviewRepo.getReviewStatsByProductId(productId);
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching product review stats:", error);
    return { success: false, error: "Failed to fetch product review statistics" };
  }
}

export async function getVendorReviewStats(vendorId: string) {
  try {
    await connectDB();
    const stats = await reviewRepo.getReviewStatsByVendorId(vendorId);
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching vendor review stats:", error);
    return { success: false, error: "Failed to fetch vendor review statistics" };
  }
}

// Helper function to update product rating
async function updateProductRating(productId: string, newRating: number, session: any) {
  try {
    const product = await productRepo.getProductById(productId);
    if (!product) return;

    // Calculate new average rating
    const currentTotal = product.rating * product.reviewCount;
    const newTotal = currentTotal + newRating;
    const newReviewCount = product.reviewCount + 1;
    const newAverageRating = newTotal / newReviewCount;

    await productRepo.updateProductById(productId, {
      rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: newReviewCount
    }, { session, new: true });
  } catch (error) {
    console.error("Error updating product rating:", error);
  }
}