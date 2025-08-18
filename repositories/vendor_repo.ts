//@ts-check
import Vendor from "@/models/vendor_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new vendor
 * @param {Object} data - The data for the vendor
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Vendor>} The created vendor
 */
export async function createVendor(data: any, options: any = {}) {
  const vendor = new Vendor(data);
  return await vendor.save(options);
}

/**
 * Gets a vendor by its id
 * @param {string} id - The id of the vendor
 * @returns {Promise<Vendor>} The vendor with populated user data
 */
export async function getVendorById(id: string) {
  return await Vendor.findById(id).populate("userId");
}

/**
 * Gets a vendor by user id
 * @param {string} userId - The user id of the vendor
 * @returns {Promise<Vendor>} The vendor with populated user data
 */
export async function getVendorByUserId(userId: string) {
  return await Vendor.findOne({ userId }).populate("userId");
}

/**
 * Gets all vendors with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Vendor[]>} Array of vendors with populated data
 */
export async function getVendors(filter: any = {}, options: QueryOptions = {}) {
  let query = Vendor.find(filter).populate("userId");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets approved vendors
 * @returns {Promise<Vendor[]>} Array of approved vendors with populated user data
 */
export async function getApprovedVendors() {
  return await Vendor.find({ status: "approved" }).populate("userId");
}

/**
 * Gets vendors by status
 * @param {string} status - The status to filter by
 * @returns {Promise<Vendor[]>} Array of vendors with the specified status
 */
export async function getVendorsByStatus(status: string) {
  return await Vendor.find({ status }).populate("userId");
}

/**
 * Updates a vendor
 * @param {string} id - The id of the vendor
 * @param {Object} data - The data to update the vendor with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Vendor>} The updated vendor
 */
export async function updateVendor(id: string, data: any, options: any = {}) {
  return await Vendor.findByIdAndUpdate(id, data, { new: true, ...options }).populate("userId");
}

/**
 * Updates vendor by id (alias for updateVendor)
 * @param {string} id - The id of the vendor
 * @param {Object} data - The data to update the vendor with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Vendor>} The updated vendor
 */
export async function updateVendorById(id: string, data: any, options: any = {}) {
  return await updateVendor(id, data, options);
}

/**
 * Updates vendor by user id
 * @param {string} userId - The user id of the vendor
 * @param {Object} data - The data to update the vendor with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Vendor>} The updated vendor
 */
export async function updateVendorByUserId(userId: string, data: any, options: any = {}) {
  return await Vendor.findOneAndUpdate({ userId }, data, { new: true, ...options }).populate("userId");
}

/**
 * Deletes a vendor by its id
 * @param {string} id - The id of the vendor
 * @returns {Promise<Vendor>} The deleted vendor
 */
export async function deleteVendor(id: string) {
  return await Vendor.findByIdAndDelete(id);
}

/**
 * Counts total vendors
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of vendors
 */
export async function countVendors(filter: any = {}) {
  return await Vendor.countDocuments(filter);
}

/**
 * Counts vendors by date range
 * @param {Date} [startDate] - The start date
 * @param {Date} [endDate] - The end date
 * @returns {Promise<number>} The count of vendors
 */
export async function countVendorsByDateRange(startDate?: Date, endDate?: Date) {
  const filter: any = {};
  if (startDate && endDate) {
    filter.createdAt = { $gte: startDate, $lte: endDate };
  }
  return countVendors(filter);
}

/**
 * Gets vendor ratings distribution
 * @returns {Promise<Array>} Vendor ratings distribution
 */
export async function getVendorRatingsDistribution() {
  // This would need aggregation to get vendor ratings distribution
  return [];
}