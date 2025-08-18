//@ts-check
import FarmerRequest from "@/models/farmer_request_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

interface UpdateData {
  [key: string]: any;
}

/**
 * Creates a new farmer request
 * @param {Object} data - The data for the farmer request
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<FarmerRequest>} The created farmer request
 */
export async function createFarmerRequest(data: any, options: any = {}) {
  const farmerRequest = new FarmerRequest(data);
  return await farmerRequest.save(options);
}

/**
 * Gets a farmer request by its id
 * @param {string} id - The id of the farmer request
 * @returns {Promise<FarmerRequest>} The farmer request with populated user data
 */
export async function getFarmerRequestById(id: string) {
  return await FarmerRequest.findById(id).populate("userId");
}

/**
 * Gets a farmer request by user id
 * @param {string} userId - The user id
 * @returns {Promise<FarmerRequest>} The farmer request with populated user data
 */
export async function getFarmerRequestByUserId(userId: string) {
  return await FarmerRequest.findOne({ userId }).populate("userId");
}

/**
 * Gets all farmer requests with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<FarmerRequest[]>} Array of farmer requests with populated data
 */
export async function getFarmerRequests(filter: any = {}, options: QueryOptions = {}) {
  let query = FarmerRequest.find(filter).populate("userId");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets farmer requests by status
 * @param {string} status - The status to filter by
 * @param {Object} [options] - Query options
 * @returns {Promise<FarmerRequest[]>} Array of farmer requests with the specified status
 */
export async function getFarmerRequestsByStatus(status: string, options: QueryOptions = {}) {
  return await getFarmerRequests({ status }, options);
}

/**
 * Gets pending farmer requests
 * @param {Object} [options] - Query options
 * @returns {Promise<FarmerRequest[]>} Array of pending farmer requests
 */
export async function getPendingFarmerRequests(options: QueryOptions = {}) {
  return await getFarmerRequests({ status: "pending" }, options);
}

/**
 * Gets approved farmer requests
 * @param {Object} [options] - Query options
 * @returns {Promise<FarmerRequest[]>} Array of approved farmer requests
 */
export async function getApprovedFarmerRequests(options: QueryOptions = {}) {
  return await getFarmerRequests({ status: "approved" }, options);
}

/**
 * Gets rejected farmer requests
 * @param {Object} [options] - Query options
 * @returns {Promise<FarmerRequest[]>} Array of rejected farmer requests
 */
export async function getRejectedFarmerRequests(options: QueryOptions = {}) {
  return await getFarmerRequests({ status: "rejected" }, options);
}

/**
 * Updates a farmer request
 * @param {string} id - The id of the farmer request
 * @param {Object} data - The data to update the farmer request with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<FarmerRequest>} The updated farmer request
 */
export async function updateFarmerRequest(id: string, data: UpdateData, options: any = {}) {
  return await FarmerRequest.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("userId");
}

/**
 * Updates farmer request status
 * @param {string} id - The id of the farmer request
 * @param {string} status - The new status
 * @param {string} adminId - The admin id who made the change
 * @param {Object} [additionalData] - Additional data to update
 * @returns {Promise<FarmerRequest>} The updated farmer request
 */
export async function updateFarmerRequestStatus(id: string, status: string, adminId: string, additionalData: any = {}) {
  const updateData = {
    status,
    adminId,
    reviewedAt: new Date(),
    updatedAt: new Date(),
    ...additionalData
  };
  
  return await updateFarmerRequest(id, updateData);
}

/**
 * Approves a farmer request
 * @param {string} id - The id of the farmer request
 * @param {string} reviewedBy - The admin who approved the request
 * @returns {Promise<FarmerRequest>} The updated farmer request
 */
export async function approveFarmerRequest(id: string, reviewedBy: string) {
  return await updateFarmerRequestStatus(id, "approved", reviewedBy);
}

/**
 * Rejects a farmer request
 * @param {string} id - The id of the farmer request
 * @param {string} reviewedBy - The admin who rejected the request
 * @param {string} rejectionReason - The reason for rejection
 * @returns {Promise<FarmerRequest>} The updated farmer request
 */
export async function rejectFarmerRequest(id: string, reviewedBy: string, rejectionReason: string) {
  return await updateFarmerRequestStatus(id, "rejected", reviewedBy, rejectionReason);
}

/**
 * Deletes a farmer request by its id
 * @param {string} id - The id of the farmer request
 * @returns {Promise<FarmerRequest>} The deleted farmer request
 */
export async function deleteFarmerRequest(id: string) {
  return await FarmerRequest.findByIdAndDelete(id);
}

/**
 * Counts farmer requests with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of farmer requests
 */
export async function countFarmerRequests(filter: any = {}) {
  return await FarmerRequest.countDocuments(filter);
}

/**
 * Gets farmer requests with pagination
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<FarmerRequest[]>} Array of farmer requests with populated data
 */
export async function getFarmerRequestsPaginated(filter: any = {}, options: QueryOptions = {}) {
  const { skip = 0, limit = 10, sort = { createdAt: -1 } } = options;
  
  const query = FarmerRequest.find(filter)
    .populate("userId")
    .sort(sort)
    .skip(skip)
    .limit(limit);
  
  return await query;
}

/**
 * Gets farmer request statistics
 * @returns {Promise<Object>} Farmer request statistics
 */
export async function getFarmerRequestStatistics() {
  const stats = await FarmerRequest.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc: any, item: any) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
}

/**
 * Updates farmer request by ID
 * @param {string} id - The farmer request ID
 * @param {Object} data - The data to update
 * @returns {Promise<FarmerRequest>} Updated farmer request
 */
export async function updateFarmerRequestById(id: string, data: any) {
  return updateFarmerRequest(id, data);
}

/**
 * Deletes farmer request by ID
 * @param {string} id - The farmer request ID
 * @returns {Promise<FarmerRequest>} Deleted farmer request
 */
export async function deleteFarmerRequestById(id: string) {
  return await FarmerRequest.findByIdAndDelete(id);
}