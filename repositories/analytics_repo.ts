//@ts-check
import Analytics from "@/models/analytics_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new analytics record
 * @param {Object} data - The data for the analytics record
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Analytics>} The created analytics record
 */
export async function createAnalytics(data: any, options: any = {}) {
  const analytics = new Analytics(data);
  return await analytics.save(options);
}

/**
 * Gets an analytics record by its id
 * @param {string} id - The id of the analytics record
 * @returns {Promise<Analytics>} The analytics record
 */
export async function getAnalyticsById(id: string) {
  return await Analytics.findById(id);
}

/**
 * Gets analytics records by type
 * @param {string} type - The analytics type
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Analytics[]>} Array of analytics records
 */
export async function getAnalyticsByType(type: string, options: QueryOptions = {}) {
  let query = Analytics.find({ type });
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets analytics records by date range
 * @param {Date} startDate - The start date
 * @param {Date} endDate - The end date
 * @param {Object} [filter] - Additional filter criteria
 * @param {Object} [options] - Query options
 * @returns {Promise<Analytics[]>} Array of analytics records
 */
export async function getAnalyticsByDateRange(startDate: Date, endDate: Date, filter: any = {}, options: QueryOptions = {}) {
  const dateFilter = {
    date: {
      $gte: startDate,
      $lte: endDate
    },
    ...filter
  };
  
  let query = Analytics.find(dateFilter);
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets daily sales analytics
 * @param {Date} [startDate] - The start date
 * @param {Date} [endDate] - The end date
 * @returns {Promise<Analytics[]>} Array of daily sales analytics
 */
export async function getDailySalesAnalytics(startDate: Date | null = null, endDate: Date | null = null) {
  const filter = { type: "daily_sales" };
  
  if (startDate && endDate) {
    return await getAnalyticsByDateRange(startDate, endDate, filter, { sort: { date: 1 } });
  }
  
  return await getAnalyticsByType("daily_sales", { sort: { date: 1 } });
}

/**
 * Gets monthly sales analytics
 * @param {Date} [startDate] - The start date
 * @param {Date} [endDate] - The end date
 * @returns {Promise<Analytics[]>} Array of monthly sales analytics
 */
export async function getMonthlySalesAnalytics(startDate: Date | null = null, endDate: Date | null = null) {
  const filter = { type: "monthly_sales" };
  
  if (startDate && endDate) {
    return await getAnalyticsByDateRange(startDate, endDate, filter, { sort: { date: 1 } });
  }
  
  return await getAnalyticsByType("monthly_sales", { sort: { date: 1 } });
}

/**
 * Gets vendor performance analytics
 * @param {string} [vendorId] - The vendor id to filter by
 * @param {Date} [startDate] - The start date
 * @param {Date} [endDate] - The end date
 * @returns {Promise<Analytics[]>} Array of vendor performance analytics
 */
export async function getVendorPerformanceAnalytics(vendorId: string | null = null, startDate: Date | null = null, endDate: Date | null = null) {
  const filter: any = { type: "vendor_performance" };
  
  if (vendorId) {
    filter["data.vendorId"] = vendorId;
  }
  
  if (startDate && endDate) {
    return await getAnalyticsByDateRange(startDate, endDate, filter, { sort: { date: 1 } });
  }
  
  return await Analytics.find(filter).sort({ date: 1 });
}

/**
 * Gets product views analytics
 * @param {string} [productId] - The product id to filter by
 * @param {Date} [startDate] - The start date
 * @param {Date} [endDate] - The end date
 * @returns {Promise<Analytics[]>} Array of product views analytics
 */
export async function getProductViewsAnalytics(productId: string | null = null, startDate: Date | null = null, endDate: Date | null = null) {
  const filter: any = { type: "product_views" };
  
  if (productId) {
    filter["data.productId"] = productId;
  }
  
  if (startDate && endDate) {
    return await getAnalyticsByDateRange(startDate, endDate, filter, { sort: { date: 1 } });
  }
  
  return await Analytics.find(filter).sort({ date: 1 });
}

/**
 * Gets user activity analytics
 * @param {Date} [startDate] - The start date
 * @param {Date} [endDate] - The end date
 * @returns {Promise<Analytics[]>} Array of user activity analytics
 */
export async function getUserActivityAnalytics(startDate: Date | null = null, endDate: Date | null = null) {
  const filter = { type: "user_activity" };
  
  if (startDate && endDate) {
    return await getAnalyticsByDateRange(startDate, endDate, filter, { sort: { date: 1 } });
  }
  
  return await getAnalyticsByType("user_activity", { sort: { date: 1 } });
}

/**
 * Gets all analytics with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Analytics[]>} Array of analytics records
 */
export async function getAnalytics(filter: any = {}, options: QueryOptions = {}) {
  let query = Analytics.find(filter);
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Updates an analytics record
 * @param {string} id - The id of the analytics record
 * @param {Object} data - The data to update the analytics record with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Analytics>} The updated analytics record
 */
export async function updateAnalytics(id: string, data: any, options: any = {}) {
  return await Analytics.findByIdAndUpdate(id, data, { new: true, ...options });
}

/**
 * Upserts analytics data (update if exists, create if not)
 * @param {Object} filter - The filter to find existing record
 * @param {Object} data - The data to update or create
 * @returns {Promise<Analytics>} The analytics record
 */
export async function upsertAnalytics(filter: any, data: any) {
  return await Analytics.findOneAndUpdate(
    filter,
    { ...data, updatedAt: new Date() },
    { new: true, upsert: true }
  );
}

/**
 * Deletes an analytics record by its id
 * @param {string} id - The id of the analytics record
 * @returns {Promise<Analytics>} The deleted analytics record
 */
export async function deleteAnalytics(id: string) {
  return await Analytics.findByIdAndDelete(id);
}

/**
 * Deletes analytics records by filter
 * @param {Object} filter - The filter criteria
 * @returns {Promise<Object>} The delete result
 */
export async function deleteAnalyticsByFilter(filter: any) {
  return await Analytics.deleteMany(filter);
}

/**
 * Counts total analytics records
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of analytics records
 */
export async function countAnalytics(filter: any = {}) {
  return await Analytics.countDocuments(filter);
}

/**
 * Gets analytics summary for dashboard
 * @param {Date} [startDate] - The start date
 * @param {Date} [endDate] - The end date
 * @returns {Promise<Object>} Analytics summary
 */
export async function getAnalyticsSummary(startDate: Date | null = null, endDate: Date | null = null) {
  const filter: any = {};
  
  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }
  
  const summary = await Analytics.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        latestDate: { $max: "$date" }
      }
    }
  ]);
  
  return summary.reduce((acc: any, item: any) => {
    acc[item._id] = {
      count: item.count,
      latestDate: item.latestDate
    };
    return acc;
  }, {});
}

/**
 * Creates analytics event
 * @param {Object} data - The analytics data
 * @returns {Promise<Analytics>} Created analytics event
 */
export async function createAnalyticsEvent(data: any) {
  return createAnalytics(data);
}

/**
 * Gets analytics events
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - The query options
 * @returns {Promise<Analytics[]>} Analytics events
 */
export async function getAnalyticsEvents(filter: any = {}, options: QueryOptions = {}) {
  return getAnalytics(filter, options);
}

/**
 * Gets event count
 * @param {string} eventType - The event type
 * @param {Object} [dateRange] - The date range
 * @param {string} [vendorId] - The vendor ID
 * @returns {Promise<number>} Event count
 */
export async function getEventCount(eventType: string, dateRange?: any, vendorId?: string) {
  const filter: any = { event: eventType };
  if (dateRange) {
    filter.timestamp = { $gte: dateRange.startDate, $lte: dateRange.endDate };
  }
  if (vendorId) {
    filter.vendorId = vendorId;
  }
  return Analytics.countDocuments(filter);
}

/**
 * Gets product views
 * @param {Object} [dateRange] - The date range
 * @param {string} [vendorId] - The vendor ID
 * @returns {Promise<Array>} Product views
 */
export async function getProductViews(dateRange?: any, vendorId?: string) {
  // Mock implementation - in real system this would track actual product views
  return [];
}