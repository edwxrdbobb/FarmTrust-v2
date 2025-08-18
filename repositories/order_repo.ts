//@ts-check
import Order from "@/models/order_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new order
 * @param {Object} data - The data for the order
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Order>} The created order
 */
export async function createOrder(data: any, options: any = {}) {
  const order = new Order(data);
  return await order.save(options);
}

/**
 * Gets an order by its id
 * @param {string} id - The id of the order
 * @returns {Promise<Order>} The order with populated data
 */
export async function getOrderById(id: string) {
  return await Order.findById(id)
    .populate("buyerId")
    .populate("items.productId")
    .populate("items.vendorId")
    .populate("shippingAddress");
}

/**
 * Gets an order by order number
 * @param {string} orderNumber - The order number
 * @returns {Promise<Order>} The order with populated data
 */
export async function getOrderByOrderNumber(orderNumber) {
  return await Order.findOne({ orderNumber })
    .populate("buyerId")
    .populate("items.productId")
    .populate("items.vendorId")
    .populate("shippingAddress");
}

/**
 * Gets orders by buyer id
 * @param {string} buyerId - The buyer id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Order[]>} Array of orders for the buyer
 */
export async function getOrdersByBuyerId(buyerId: string, options: QueryOptions = {}) {
  let query = Order.find({ buyerId })
    .populate("buyerId")
    .populate("items.productId")
    .populate("items.vendorId")
    .populate("shippingAddress");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets orders by vendor id
 * @param {string} vendorId - The vendor id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Order[]>} Array of orders containing items from the vendor
 */
export async function getOrdersByVendorId(vendorId: string, options: QueryOptions = {}) {
  let query = Order.find({ "items.vendorId": vendorId })
    .populate("buyerId")
    .populate("items.productId")
    .populate("items.vendorId")
    .populate("shippingAddress");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets all orders with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Order[]>} Array of orders with populated data
 */
export async function getOrders(filter: any = {}, options: QueryOptions = {}) {
  let query = Order.find(filter)
    .populate("buyerId")
    .populate("items.productId")
    .populate("items.vendorId")
    .populate("shippingAddress");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets orders by status
 * @param {string} status - The status to filter by
 * @param {Object} [options] - Query options
 * @returns {Promise<Order[]>} Array of orders with the specified status
 */
export async function getOrdersByStatus(status: string, options: QueryOptions = {}) {
  return await getOrders({ status }, options);
}

/**
 * Gets recent orders
 * @param {number} [limit=10] - Number of recent orders to fetch
 * @returns {Promise<Order[]>} Array of recent orders
 */
export async function getRecentOrders(limit: number = 10) {
  return await getOrders({}, { sort: { createdAt: -1 }, limit });
}

/**
 * Updates an order
 * @param {string} id - The id of the order
 * @param {Object} data - The data to update the order with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Order>} The updated order
 */
export async function updateOrder(id: string, data: any, options: any = {}) {
  return await Order.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("buyerId")
    .populate("items.productId")
    .populate("items.vendorId")
    .populate("shippingAddress");
}

/**
 * Updates order status
 * @param {string} id - The id of the order
 * @param {string} status - The new status
 * @returns {Promise<Order>} The updated order
 */
export async function updateOrderStatus(id: string, status: string) {
  return await updateOrder(id, { status, updatedAt: new Date() });
}

/**
 * Deletes an order by its id
 * @param {string} id - The id of the order
 * @returns {Promise<Order>} The deleted order
 */
export async function deleteOrder(id: string) {
  return await Order.findByIdAndDelete(id);
}

/**
 * Counts total orders
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of orders
 */
export async function countOrders(filter: any = {}) {
  return await Order.countDocuments(filter);
}

/**
 * Gets order statistics
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<Object>} Order statistics
 */
export async function getOrderStats(filter: any = {}) {
  const stats = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
        averageAmount: { $avg: "$totalAmount" }
      }
    }
  ]);
  
  return stats[0] || { totalOrders: 0, totalAmount: 0, averageAmount: 0 };
}

/**
 * Count orders by vendor id
 * @param {string} vendorId - The vendor id
 * @returns {Promise<number>} The count of orders for the vendor
 */
export async function countOrdersByVendor(vendorId: string) {
  return await Order.countDocuments({ "items.vendorId": vendorId });
}

/**
 * Get total revenue by vendor id
 * @param {string} vendorId - The vendor id
 * @returns {Promise<number>} The total revenue for the vendor
 */
export async function getTotalRevenueByVendor(vendorId: string) {
  const result = await Order.aggregate([
    { $match: { "items.vendorId": vendorId, status: { $in: ["delivered", "paid"] } } },
    { $unwind: "$items" },
    { $match: { "items.vendorId": vendorId } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
      }
    }
  ]);
  
  return result[0]?.totalRevenue || 0;
}

/**
 * Count orders by vendor id and status
 * @param {string} vendorId - The vendor id
 * @param {string} status - The status to filter by
 * @returns {Promise<number>} The count of orders with specified status for the vendor
 */
export async function countOrdersByVendorAndStatus(vendorId: string, status: string) {
  return await Order.countDocuments({ 
    "items.vendorId": vendorId, 
    status: status 
  });
}

/**
 * Get vendor sales analytics for a date range
 * @param {string} vendorId - The vendor id
 * @param {Date} startDate - Start date for analytics
 * @param {Date} endDate - End date for analytics
 * @returns {Promise<Object[]>} Sales analytics data
 */
export async function getVendorSalesAnalytics(vendorId: string, startDate: Date, endDate: Date) {
  return await Order.aggregate([
    {
      $match: {
        "items.vendorId": vendorId,
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ["delivered", "paid"] }
      }
    },
    { $unwind: "$items" },
    { $match: { "items.vendorId": vendorId } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        },
        revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
  ]);
}

/**
 * Gets recent orders by vendor
 * @param {string} vendorId - The vendor ID
 * @param {number} limit - The limit of orders to return
 * @returns {Promise<Order[]>} Recent orders for the vendor
 */
export async function getRecentOrdersByVendor(vendorId: string, limit: number = 10) {
  return await Order.find({ "items.vendorId": vendorId })
    .populate("buyerId", "firstName lastName email")
    .populate("items.productId", "name image")
    .sort({ createdAt: -1 })
    .limit(limit);
}

/**
 * Gets sales data
 * @param {string} [vendorId] - The vendor ID
 * @param {Date} [startDate] - The start date
 * @param {Date} [endDate] - The end date
 * @returns {Promise<Object>} Sales data
 */
export async function getSalesData(vendorId?: string, startDate?: Date, endDate?: Date) {
  const filter: any = {};
  if (vendorId) filter.vendor = vendorId;
  if (startDate && endDate) {
    filter.createdAt = { $gte: startDate, $lte: endDate };
  }
  return getOrders(filter, { sort: { createdAt: -1 } });
}

/**
 * Gets top products
 * @param {number} limit - The limit of products to return
 * @returns {Promise<Order[]>} Top products
 */
export async function getTopProducts(limit: number = 10) {
  // This would need aggregation to get top products by sales
  return getOrders({}, { limit, sort: { createdAt: -1 } });
}

/**
 * Gets top vendors
 * @param {number} limit - The limit of vendors to return
 * @returns {Promise<Order[]>} Top vendors
 */
export async function getTopVendors(limit: number = 10) {
  // This would need aggregation to get top vendors by sales
  return getOrders({}, { limit, sort: { createdAt: -1 } });
}

/**
 * Gets sales by category
 * @returns {Promise<Array>} Sales by category
 */
export async function getSalesByCategory() {
  // This would need aggregation to get sales by category
  return [];
}

/**
 * Gets sales by period
 * @param {Date} [startDate] - The start date
 * @param {Date} [endDate] - The end date
 * @returns {Promise<Order[]>} Sales by period
 */
export async function getSalesByPeriod(startDate?: Date, endDate?: Date) {
  const filter: any = {};
  if (startDate && endDate) {
    filter.createdAt = { $gte: startDate, $lte: endDate };
  }
  return getOrders(filter, { sort: { createdAt: -1 } });
}

/**
 * Gets active users count
 * @returns {Promise<number>} Active users count
 */
export async function getActiveUsersCount() {
  // This would need aggregation to count unique active users
  return 0;
}

/**
 * Gets top buyers
 * @param {number} limit - The limit of buyers to return
 * @returns {Promise<Order[]>} Top buyers
 */
export async function getTopBuyers(limit: number = 10) {
  // This would need aggregation to get top buyers by order count/value
  return getOrders({}, { limit, sort: { createdAt: -1 } });
}

/**
 * Gets vendor orders
 * @param {string} vendorId - The vendor ID
 * @returns {Promise<Order[]>} Vendor orders
 */
export async function getVendorOrders(vendorId: string) {
  return getOrdersByVendorId(vendorId, {});
}

/**
 * Gets vendor sales data
 * @param {string} [vendorId] - The vendor ID
 * @returns {Promise<Array>} Vendor sales data
 */
export async function getVendorSalesData(vendorId?: string) {
  if (!vendorId) return [];
  return getVendorSalesAnalytics(vendorId, new Date(0), new Date());
}

/**
 * Gets user orders
 * @param {string} userId - The user ID
 * @returns {Promise<Order[]>} User orders
 */
export async function getUserOrders(userId: string) {
  return getOrdersByBuyerId(userId, {});
}

/**
 * Gets active vendors count
 * @param {Object} [dateRange] - The date range
 * @returns {Promise<number>} Active vendors count
 */
export async function getActiveVendorsCount(dateRange?: any) {
  // This would need aggregation to count unique active vendors
  return 0;
}

/**
 * Gets product order counts
 * @param {Object} [dateRange] - The date range
 * @param {string} [vendorId] - The vendor ID
 * @returns {Promise<Array>} Product order counts
 */
export async function getProductOrderCounts(dateRange?: any, vendorId?: string) {
  // Mock implementation - would need aggregation to get product order counts
  return [];
}

/**
 * Updates order by ID
 * @param {string} id - The order ID
 * @param {Object} data - The data to update
 * @returns {Promise<Order>} Updated order
 */
export async function updateOrderById(id: string, data: any) {
  return updateOrder(id, data);
}