//@ts-check
import Product from "@/models/product_model";
import Category from "@/models/category_model";
import Vendor from "@/models/vendor_model";

// Ensure models are registered
import "@/models/index";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new product
 * @param {Object} data - The data for the product
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Product>} The created product
 */
export async function createProduct(data: any, options: any = {}) {
  const product = new Product(data);
  return await product.save(options);
}

/**
 * Gets a product by its id
 * @param {string} id - The id of the product
 * @returns {Promise<Product>} The product with populated data
 */
export async function getProductById(id: string) {
  return await Product.findById(id)
    .populate("vendorId")
    .populate("categoryId");
}

/**
 * Gets products by vendor id
 * @param {string} vendorId - The vendor id
 * @returns {Promise<Product[]>} Array of products with populated data
 */
export async function getProductsByVendorId(vendorId: string) {
  return await Product.find({ vendorId })
    .populate("vendorId")
    .populate("categoryId");
}

/**
 * Gets products by category id
 * @param {string} categoryId - The category id
 * @returns {Promise<Product[]>} Array of products with populated data
 */
export async function getProductsByCategoryId(categoryId: string) {
  return await Product.find({ categoryId })
    .populate("vendorId")
    .populate("categoryId");
}

/**
 * Gets all products with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Product[]>} Array of products with populated data
 */
export async function getProducts(filter: any = {}, options: QueryOptions = {}) {
  let query = Product.find(filter)
    .populate("vendorId")
    .populate("categoryId");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets active products
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Product[]>} Array of active products
 */
export async function getActiveProducts(options: QueryOptions = {}) {
  return await getProducts({ available: true, deleted_at: null }, options);
}

/**
 * Gets products by availability status
 * @param {boolean} available - The availability status to filter by
 * @returns {Promise<Product[]>} Array of products with the specified status
 */
export async function getProductsByStatus(available: boolean) {
  return await Product.find({ available, deleted_at: null })
    .populate("vendorId")
    .populate("categoryId");
}

/**
 * Search products by name or description
 * @param {string} searchTerm - The search term
 * @param {Object} [filters] - Additional filters
 * @param {number} [page] - Page number
 * @param {number} [limit] - Items per page
 * @returns {Promise<{products: Product[], pagination: any}>} Matching products with pagination
 */
export async function searchProducts(searchTerm: string, filters: any = {}, page: number = 1, limit: number = 10) {
  const searchRegex = new RegExp(searchTerm, 'i');
  const skip = (page - 1) * limit;
  
  const baseFilter = {
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { tags: { $in: [searchRegex] } }
    ],
    available: true,
    deleted_at: null,
    ...filters
  };
  
  const products = await Product.find(baseFilter)
    .populate("vendorId")
    .populate("categoryId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Product.countDocuments(baseFilter);
  
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Updates a product
 * @param {string} id - The id of the product
 * @param {Object} data - The data to update the product with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Product>} The updated product
 */
export async function updateProduct(id: string, data: any, options: any = {}) {
  return await Product.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("vendorId")
    .populate("categoryId");
}

/**
 * Deletes a product by its id
 * @param {string} id - The id of the product
 * @returns {Promise<Product>} The deleted product
 */
export async function deleteProduct(id: string) {
  return await Product.findByIdAndDelete(id);
}

/**
 * Counts total products
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of products
 */
export async function countProducts(filter: any = {}) {
  return await Product.countDocuments(filter);
}

/**
 * Updates product stock
 * @param {string} id - The id of the product
 * @param {number} quantity - The quantity to add/subtract
 * @returns {Promise<Product>} The updated product
 */
export async function updateProductStock(id: string, quantity: number) {
  return await Product.findByIdAndUpdate(
    id,
    { $inc: { quantity: quantity } },
    { new: true }
  ).populate("vendorId").populate("categoryId");
}

/**
 * Gets products by vendor id with pagination
 * @param {string} vendorId - The vendor id
 * @param {number} [page] - Page number
 * @param {number} [limit] - Items per page
 * @returns {Promise<{products: Product[], pagination: any}>} Array of products with pagination
 */
export async function getProductsByVendor(vendorId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const products = await Product.find({ vendorId, deleted_at: null })
    .populate("vendorId")
    .populate("categoryId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Product.countDocuments({ vendorId, deleted_at: null });
  
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Gets products by category id with pagination
 * @param {string} categoryId - The category id
 * @param {number} [page] - Page number
 * @param {number} [limit] - Items per page
 * @returns {Promise<{products: Product[], pagination: any}>} Array of products with pagination
 */
export async function getProductsByCategory(categoryId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const products = await Product.find({ categoryId, available: true, deleted_at: null })
    .populate("vendorId")
    .populate("categoryId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Product.countDocuments({ categoryId, available: true, deleted_at: null });
  
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Gets featured products
 * @param {number} [limit] - Number of products to return
 * @returns {Promise<Product[]>} Array of featured products
 */
export async function getFeaturedProducts(limit: number = 10) {
  return await Product.find({ featured: true, available: true, deleted_at: null })
    .populate("vendorId")
    .populate("categoryId")
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit);
}

/**
 * Gets recent products
 * @param {number} [limit] - Number of products to return
 * @returns {Promise<Product[]>} Array of recent products
 */
export async function getRecentProducts(limit: number = 10) {
  return await Product.find({ available: true, deleted_at: null })
    .populate("vendorId")
    .populate("categoryId")
    .sort({ createdAt: -1 })
    .limit(limit);
}

/**
 * Gets products with filters and pagination
 * @param {Object} filters - Filter criteria
 * @param {number} [page] - Page number
 * @param {number} [limit] - Items per page
 * @returns {Promise<{products: Product[], pagination: any}>} Products with pagination
 */
export async function getProductsWithFilters(filters: any = {}, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  // Build filter query
  const baseFilter: any = {
    available: true,
    deleted_at: null
  };
  
  if (filters.category) {
    baseFilter.categoryId = filters.category;
  }
  
  if (filters.vendor) {
    baseFilter.vendorId = filters.vendor;
  }
  
  if (filters.organic !== undefined) {
    baseFilter.organic = filters.organic;
  }
  
  if (filters.featured !== undefined) {
    baseFilter.featured = filters.featured;
  }
  
  if (filters.minPrice || filters.maxPrice) {
    baseFilter.price = {};
    if (filters.minPrice) baseFilter.price.$gte = filters.minPrice;
    if (filters.maxPrice) baseFilter.price.$lte = filters.maxPrice;
  }
  
  // Build sort criteria
  let sortCriteria: any = { createdAt: -1 };
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price_low':
        sortCriteria = { price: 1 };
        break;
      case 'price_high':
        sortCriteria = { price: -1 };
        break;
      case 'name':
        sortCriteria = { name: 1 };
        break;
      case 'rating':
        sortCriteria = { rating: -1 };
        break;
      case 'newest':
      default:
        sortCriteria = { createdAt: -1 };
        break;
    }
  }
  
  const products = await Product.find(baseFilter)
    .populate("vendorId")
    .populate("categoryId")
    .sort(sortCriteria)
    .skip(skip)
    .limit(limit);
    
  const total = await Product.countDocuments(baseFilter);
  
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}/**
 * Count products by vendor id
 * @param {string} vendorId - The vendor id
 * @returns {Promise<number>} The count of products for the vendor
 */
export async function countProductsByVendor(vendorId: string) {
  return await Product.countDocuments({ vendorId, deleted_at: null });
}

/**
 * Get vendor product views analytics (mock implementation)
 * @param {string} vendorId - The vendor id
 * @param {Date} startDate - Start date for analytics
 * @param {Date} endDate - End date for analytics
 * @returns {Promise<Object[]>} Product views analytics data
 */
export async function getVendorProductViews(vendorId: string, startDate: Date, endDate: Date) {
  // This is a mock implementation as product views tracking would require additional schema
  // In a real implementation, you'd track views in a separate collection or add view tracking to products
  return [];
}

/**
 * Get vendor's top performing products
 * @param {string} vendorId - The vendor id
 * @param {number} limit - Number of top products to return
 * @returns {Promise<Product[]>} Array of top performing products
 */
export async function getVendorTopProducts(vendorId: string, limit: number = 5) {
  return await Product.find({ vendorId, deleted_at: null })
    .populate("vendorId")
    .populate("categoryId")
    .sort({ rating: -1, sales: -1 })
    .limit(limit);
}

/**
 * Updates products category
 * @param {string} oldCategoryId - The old category ID
 * @param {string} newCategoryId - The new category ID
 * @returns {Promise<Object>} Update result
 */
export async function updateProductsCategory(oldCategoryId: string, newCategoryId: string) {
  const result = await Product.updateMany(
    { categoryId: oldCategoryId },
    { categoryId: newCategoryId }
  );
  return result;
}

/**
 * Gets top rated products
 * @param {string} [vendorId] - The vendor ID
 * @param {number} limit - The limit of products to return
 * @returns {Promise<Product[]>} Top rated products
 */
export async function getTopRatedProducts(vendorId?: string, limit: number = 10) {
  const filter: any = {};
  if (vendorId) filter.vendorId = vendorId;
  return getProducts(filter, { limit, sort: { rating: -1 } });
}

/**
 * Gets low stock products
 * @param {string} [vendorId] - The vendor ID
 * @param {number} limit - The limit of products to return
 * @returns {Promise<Product[]>} Low stock products
 */
export async function getLowStockProducts(vendorId?: string, limit: number = 10) {
  const filter: any = { quantity: { $lt: 10 } };
  if (vendorId) filter.vendorId = vendorId;
  return getProducts(filter, { limit, sort: { quantity: 1 } });
}

/**
 * Gets vendor products
 * @param {string} vendorId - The vendor ID
 * @returns {Promise<Product[]>} Vendor products
 */
export async function getVendorProducts(vendorId: string) {
  return getProductsByVendorId(vendorId);
}

/**
 * Updates product by ID
 * @param {string} id - The product ID
 * @param {Object} data - The data to update
 * @returns {Promise<Product>} Updated product
 */
export async function updateProductById(id: string, data: any) {
  return updateProduct(id, data);
}

/**
 * Gets products by category for vendor
 * @param {string} [vendorId] - The vendor ID
 * @returns {Promise<Array>} Products by category
 */
export async function getProductsByCategoryForVendor(vendorId?: string) {
  // Mock implementation - would need aggregation to get products by category
  return [];
}

/**
 * Counts products by date range
 * @param {Object} [dateRange] - The date range
 * @param {string} [vendorId] - The vendor ID
 * @returns {Promise<number>} Count of products
 */
export async function countProductsByDateRange(dateRange: any, vendorId?: string) {
  const filter: any = {};
  if (vendorId) filter.vendorId = vendorId;
  if (dateRange) {
    filter.createdAt = { $gte: dateRange.startDate, $lte: dateRange.endDate };
  }
  return countProducts(filter);
}