//@ts-check
import Review from "@/models/review_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new review
 * @param {Object} data - The data for the review
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Review>} The created review
 */
export async function createReview(data: any, options: any = {}) {
  const review = new Review(data);
  return await review.save(options);
}

/**
 * Gets a review by its id
 * @param {string} id - The id of the review
 * @returns {Promise<Review>} The review with populated data
 */
export async function getReviewById(id: string) {
  return await Review.findById(id)
    .populate("productId")
    .populate("userId", "name email");
}

/**
 * Gets reviews by product id
 * @param {string} productId - The product id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Review[]>} Array of reviews for the product
 */
export async function getReviewsByProductId(productId: string, options: QueryOptions = {}) {
  let query = Review.find({ productId })
    .populate("productId")
    .populate("userId", "name email");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets reviews by user id
 * @param {string} userId - The user id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Review[]>} Array of reviews by the user
 */
export async function getReviewsByUserId(userId: string, options: QueryOptions = {}) {
  let query = Review.find({ userId })
    .populate("productId")
    .populate("userId", "name email");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets a review by user and product
 * @param {string} userId - The user id
 * @param {string} productId - The product id
 * @returns {Promise<Review>} The review
 */
export async function getReviewByUserAndProduct(userId: string, productId: string) {
  return await Review.findOne({ userId, productId })
    .populate("productId")
    .populate("userId", "name email");
}

/**
 * Gets all reviews with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Review[]>} Array of reviews with populated data
 */
export async function getReviews(filter: any = {}, options: QueryOptions = {}) {
  let query = Review.find(filter)
    .populate("productId")
    .populate("userId", "name email");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets reviews by rating
 * @param {number} rating - The rating to filter by
 * @param {Object} [options] - Query options
 * @returns {Promise<Review[]>} Array of reviews with the specified rating
 */
export async function getReviewsByRating(rating: number, options: QueryOptions = {}) {
  return await getReviews({ rating }, options);
}

/**
 * Gets recent reviews
 * @param {number} [limit=10] - Number of recent reviews to fetch
 * @returns {Promise<Review[]>} Array of recent reviews
 */
export async function getRecentReviews(limit: number = 10) {
  return await getReviews({}, { sort: { createdAt: -1 }, limit });
}

/**
 * Gets reviews for vendor's products
 * @param {string} vendorId - The vendor id
 * @param {Object} [options] - Query options
 * @returns {Promise<Review[]>} Array of reviews for vendor's products
 */
export async function getReviewsByVendorId(vendorId: string, options: QueryOptions = {}) {
  // First get products by vendor, then get reviews for those products
  const Product = require("@/models/product_model").default;
  const products = await Product.find({ vendorId }).select("_id");
  const productIds = products.map((p: any) => p._id);
  
  return await getReviews({ productId: { $in: productIds } }, options);
}

/**
 * Updates a review
 * @param {string} id - The id of the review
 * @param {Object} data - The data to update the review with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Review>} The updated review
 */
export async function updateReview(id: string, data: any, options: any = {}) {
  return await Review.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("productId")
    .populate("userId", "name email");
}

/**
 * Deletes a review by its id
 * @param {string} id - The id of the review
 * @returns {Promise<Review>} The deleted review
 */
export async function deleteReview(id: string) {
  return await Review.findByIdAndDelete(id);
}

/**
 * Counts total reviews
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of reviews
 */
export async function countReviews(filter: any = {}) {
  return await Review.countDocuments(filter);
}

/**
 * Gets review statistics for a product
 * @param {string} productId - The product id
 * @returns {Promise<Object>} Review statistics
 */
export async function getProductReviewStats(productId: string) {
  const stats = await Review.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        ratingDistribution: {
          $push: "$rating"
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return { totalReviews: 0, averageRating: 0, ratingDistribution: [] };
  }
  
  const result = stats[0];
  
  // Calculate rating distribution
  const distribution: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.ratingDistribution.forEach((rating: number) => {
    distribution[rating] = (distribution[rating] || 0) + 1;
  });
  
  return {
    totalReviews: result.totalReviews,
    averageRating: Math.round(result.averageRating * 10) / 10, // Round to 1 decimal
    ratingDistribution: distribution
  };
}

/**
 * Gets overall review statistics
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<Object>} Overall review statistics
 */
export async function getOverallReviewStats(filter: any = {}) {
  const stats = await Review.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" }
      }
    }
  ]);
  
  return stats[0] || { totalReviews: 0, averageRating: 0 };
}

/**
 * Gets review by user and vendor
 * @param {string} userId - The user ID
 * @param {string} vendorId - The vendor ID
 * @returns {Promise<Review[]>} Review by user and vendor
 */
export async function getReviewByUserAndVendor(userId: string, vendorId: string) {
  return getReviews({ userId, vendorId }, { limit: 1 });
}

/**
 * Updates review by ID
 * @param {string} id - The review ID
 * @param {Object} data - The data to update
 * @returns {Promise<Review>} Updated review
 */
export async function updateReviewById(id: string, data: any) {
  return updateReview(id, data);
}

/**
 * Deletes review by ID
 * @param {string} id - The review ID
 * @returns {Promise<Review>} Deleted review
 */
export async function deleteReviewById(id: string) {
  return deleteReview(id);
}

/**
 * Gets review stats by product ID
 * @param {string} productId - The product ID
 * @returns {Promise<Object>} Review stats by product
 */
export async function getReviewStatsByProductId(productId: string) {
  return getProductReviewStats(productId);
}

/**
 * Gets review stats by vendor ID
 * @param {string} vendorId - The vendor ID
 * @returns {Promise<Review[]>} Review stats by vendor
 */
export async function getReviewStatsByVendorId(vendorId: string) {
  return getReviewsByVendorId(vendorId, {});
}

/**
 * Gets user reviews
 * @param {string} userId - The user ID
 * @returns {Promise<Review[]>} User reviews
 */
export async function getUserReviews(userId: string) {
  return getReviewsByUserId(userId, {});
}

/**
 * Gets vendor reviews
 * @param {string} vendorId - The vendor ID
 * @returns {Promise<Review[]>} Vendor reviews
 */
export async function getVendorReviews(vendorId: string) {
  return getReviewsByVendorId(vendorId, {});
}