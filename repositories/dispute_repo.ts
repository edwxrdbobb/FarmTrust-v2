//@ts-check
import Dispute from "@/models/dispute_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new dispute
 * @param {Object} data - The data for the dispute
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Dispute>} The created dispute
 */
export async function createDispute(data: any, options: any = {}) {
  const dispute = new Dispute(data);
  return await dispute.save(options);
}

/**
 * Gets a dispute by its id
 * @param {string} id - The id of the dispute
 * @returns {Promise<Dispute>} The dispute with populated data
 */
export async function getDisputeById(id: string) {
  return await Dispute.findById(id)
    .populate("orderId")
    .populate("buyerId")
    .populate("vendorId")
    .populate("adminId");
}

/**
 * Gets a dispute by order id
 * @param {string} orderId - The order id
 * @returns {Promise<Dispute>} The dispute with populated data
 */
export async function getDisputeByOrderId(orderId: string) {
  return await Dispute.findOne({ orderId })
    .populate("orderId")
    .populate("buyerId")
    .populate("vendorId")
    .populate("adminId");
}

/**
 * Gets disputes by buyer id
 * @param {string} buyerId - The buyer id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Dispute[]>} Array of disputes for the buyer
 */
export async function getDisputesByBuyerId(buyerId: string, options: QueryOptions = {}) {
  let query = Dispute.find({ buyerId })
    .populate("orderId")
    .populate("buyerId")
    .populate("vendorId")
    .populate("adminId");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets disputes by vendor id
 * @param {string} vendorId - The vendor id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Dispute[]>} Array of disputes for the vendor
 */
export async function getDisputesByVendorId(vendorId: string, options: QueryOptions = {}) {
  let query = Dispute.find({ vendorId })
    .populate("orderId")
    .populate("buyerId")
    .populate("vendorId")
    .populate("adminId");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets all disputes with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Dispute[]>} Array of disputes with populated data
 */
export async function getDisputes(filter: any = {}, options: QueryOptions = {}) {
  let query = Dispute.find(filter)
    .populate("orderId")
    .populate("buyerId")
    .populate("vendorId")
    .populate("adminId");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets disputes by status
 * @param {string} status - The status to filter by
 * @param {Object} [options] - Query options
 * @returns {Promise<Dispute[]>} Array of disputes with the specified status
 */
export async function getDisputesByStatus(status: string, options: QueryOptions = {}) {
  return await getDisputes({ status }, options);
}

/**
 * Gets open disputes
 * @param {Object} [options] - Query options
 * @returns {Promise<Dispute[]>} Array of open disputes
 */
export async function getOpenDisputes(options: QueryOptions = {}) {
  return await getDisputes({ status: "open" }, options);
}

/**
 * Gets disputes assigned to admin
 * @param {string} adminId - The admin id
 * @param {Object} [options] - Query options
 * @returns {Promise<Dispute[]>} Array of disputes assigned to the admin
 */
export async function getDisputesByAdminId(adminId: string, options: QueryOptions = {}) {
  return await getDisputes({ adminId }, options);
}

/**
 * Updates a dispute
 * @param {string} id - The id of the dispute
 * @param {Object} data - The data to update the dispute with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Dispute>} The updated dispute
 */
export async function updateDispute(id: string, data: any, options: any = {}) {
  return await Dispute.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("orderId")
    .populate("buyerId")
    .populate("vendorId")
    .populate("adminId");
}

/**
 * Updates dispute status
 * @param {string} id - The id of the dispute
 * @param {string} status - The new status
 * @returns {Promise<Dispute>} The updated dispute
 */
export async function updateDisputeStatus(id: string, status: string) {
  return await updateDispute(id, { status, updatedAt: new Date() });
}

/**
 * Assigns dispute to admin
 * @param {string} id - The id of the dispute
 * @param {string} adminId - The admin id
 * @returns {Promise<Dispute>} The updated dispute
 */
export async function assignDisputeToAdmin(id: string, adminId: string) {
  return await updateDispute(id, { adminId, status: "in_progress", updatedAt: new Date() });
}

/**
 * Deletes a dispute by its id
 * @param {string} id - The id of the dispute
 * @returns {Promise<Dispute>} The deleted dispute
 */
export async function deleteDispute(id: string) {
  return await Dispute.findByIdAndDelete(id);
}

/**
 * Counts total disputes
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of disputes
 */
export async function countDisputes(filter: any = {}) {
  return await Dispute.countDocuments(filter);
}

/**
 * Gets dispute statistics
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<Object>} Dispute statistics
 */
export async function getDisputeStats(filter: any = {}) {
  const stats = await Dispute.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc: any, stat: any) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
}

// Add missing functions that are being imported
export async function getDisputeByOrder(orderId: string) {
  return getDisputeByOrderId(orderId);
}

export async function updateDisputeById(id: string, data: any) {
  return updateDispute(id, data);
}

export async function getDisputeStatsByUser(userId: string) {
  return getDisputesByBuyerId(userId, {});
}

export async function getDisputeStatsByVendor(vendorId: string) {
  return getDisputesByVendorId(vendorId, {});
}

export async function getGlobalDisputeStats() {
  return getDisputeStats({});
}