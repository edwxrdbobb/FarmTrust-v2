//@ts-check
import Escrow from "@/models/escrow_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new escrow
 * @param {Object} data - The data for the escrow
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Escrow>} The created escrow
 */
export async function createEscrow(data: any, options: any = {}) {
  const escrow = new Escrow(data);
  return await escrow.save(options);
}

/**
 * Gets an escrow by its id
 * @param {string} id - The id of the escrow
 * @returns {Promise<Escrow>} The escrow with populated data
 */
export async function getEscrowById(id: string) {
  return await Escrow.findById(id)
    .populate("orderId")
    .populate("buyerId", "name email")
    .populate("vendorId");
}

/**
 * Gets an escrow by order id
 * @param {string} orderId - The order id
 * @returns {Promise<Escrow>} The escrow with populated data
 */
export async function getEscrowByOrderId(orderId: string) {
  return await Escrow.findOne({ orderId })
    .populate("orderId")
    .populate("buyerId", "name email")
    .populate("vendorId");
}

/**
 * Gets an escrow by order (alias for getEscrowByOrderId)
 * @param {string} orderId - The order id
 * @returns {Promise<Escrow>} The escrow with populated data
 */
export async function getEscrowByOrder(orderId: string) {
  return getEscrowByOrderId(orderId);
}

/**
 * Gets escrows by buyer id
 * @param {string} buyerId - The buyer id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Escrow[]>} Array of escrows for the buyer
 */
export async function getEscrowsByBuyerId(buyerId: string, options: QueryOptions = {}) {
  let query = Escrow.find({ buyerId })
    .populate("orderId")
    .populate("buyerId", "name email")
    .populate("vendorId");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets escrows by vendor id
 * @param {string} vendorId - The vendor id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Escrow[]>} Array of escrows for the vendor
 */
export async function getEscrowsByVendorId(vendorId: string, options: QueryOptions = {}) {
  let query = Escrow.find({ vendorId })
    .populate("orderId")
    .populate("buyerId", "name email")
    .populate("vendorId");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets all escrows with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Escrow[]>} Array of escrows with populated data
 */
export async function getEscrows(filter: any = {}, options: QueryOptions = {}) {
  let query = Escrow.find(filter)
    .populate("orderId")
    .populate("buyerId", "name email")
    .populate("vendorId");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets escrows by status
 * @param {string} status - The status to filter by
 * @param {Object} [options] - Query options
 * @returns {Promise<Escrow[]>} Array of escrows with the specified status
 */
export async function getEscrowsByStatus(status: string, options: QueryOptions = {}) {
  return await getEscrows({ status }, options);
}

/**
 * Gets active escrows (pending or funded)
 * @param {Object} [options] - Query options
 * @returns {Promise<Escrow[]>} Array of active escrows
 */
export async function getActiveEscrows(options: QueryOptions = {}) {
  return await getEscrows({ status: { $in: ["pending", "funded"] } }, options);
}

/**
 * Gets escrows pending confirmation (3-day period)
 * @param {Object} [options] - Query options
 * @returns {Promise<Escrow[]>} Array of escrows pending confirmation
 */
export async function getEscrowsPendingConfirmation(options: QueryOptions = {}) {
  return await getEscrows({ status: "pending_confirmation" }, options);
}

/**
 * Gets escrows pending release
 * @param {Object} [options] - Query options
 * @returns {Promise<Escrow[]>} Array of escrows pending release
 */
export async function getEscrowsPendingRelease(options: QueryOptions = {}) {
  return await getEscrows({ status: "funded" }, options);
}

/**
 * Updates an escrow
 * @param {string} id - The id of the escrow
 * @param {Object} data - The data to update the escrow with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Escrow>} The updated escrow
 */
export async function updateEscrow(id: string, data: any, options: any = {}) {
  return await Escrow.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("orderId")
    .populate("buyerId", "name email")
    .populate("vendorId");
}

/**
 * Updates escrow status
 * @param {string} id - The id of the escrow
 * @param {string} status - The new status
 * @returns {Promise<Escrow>} The updated escrow
 */
export async function updateEscrowStatus(id: string, status: string) {
  const updateData: any = { status, updatedAt: new Date() };
  
  // Set release date for completed escrows
  if (status === "released_to_vendor" || status === "refunded_to_buyer") {
    updateData.releasedAt = new Date();
  }
  
  return await updateEscrow(id, updateData);
}

/**
 * Releases escrow funds
 * @param {string} id - The id of the escrow
 * @returns {Promise<Escrow>} The updated escrow
 */
export async function releaseEscrow(id: string) {
  return await updateEscrowStatus(id, "released_to_vendor");
}

/**
 * Refunds escrow funds
 * @param {string} id - The id of the escrow
 * @returns {Promise<Escrow>} The updated escrow
 */
export async function refundEscrow(id: string) {
  return await updateEscrowStatus(id, "refunded_to_buyer");
}

/**
 * Funds escrow (moves from pending to funded)
 * @param {string} id - The id of the escrow
 * @returns {Promise<Escrow>} The updated escrow
 */
export async function fundEscrow(id: string) {
  return await updateEscrowStatus(id, "funded");
}

/**
 * Marks escrow as delivered and starts 3-day confirmation period
 * @param {string} id - The id of the escrow
 * @returns {Promise<Escrow>} The updated escrow
 */
export async function markEscrowAsDelivered(id: string) {
  const confirmationDeadline = new Date();
  confirmationDeadline.setDate(confirmationDeadline.getDate() + 3);
  
  return await updateEscrow(id, {
    status: "pending_confirmation",
    deliveredAt: new Date(),
    confirmationDeadline,
    updatedAt: new Date()
  });
}

/**
 * Confirms delivery by buyer
 * @param {string} id - The id of the escrow
 * @returns {Promise<Escrow>} The updated escrow
 */
export async function confirmDelivery(id: string) {
  return await updateEscrow(id, {
    status: "released_to_vendor",
    buyerConfirmedAt: new Date(),
    releasedAt: new Date(),
    releaseReason: "buyer_approval",
    updatedAt: new Date()
  });
}

/**
 * Gets escrows that have passed confirmation deadline
 * @param {Object} [options] - Query options
 * @returns {Promise<Escrow[]>} Array of escrows ready for auto-release
 */
export async function getEscrowsReadyForAutoRelease(options: QueryOptions = {}) {
  const now = new Date();
  return await getEscrows({
    status: "pending_confirmation",
    confirmationDeadline: { $lte: now }
  }, options);
}

/**
 * Deletes an escrow by its id
 * @param {string} id - The id of the escrow
 * @returns {Promise<Escrow>} The deleted escrow
 */
export async function deleteEscrow(id: string) {
  return await Escrow.findByIdAndDelete(id);
}

/**
 * Counts total escrows
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of escrows
 */
export async function countEscrows(filter: any = {}) {
  return await Escrow.countDocuments(filter);
}

/**
 * Gets escrow statistics
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<Object>} Escrow statistics
 */
export async function getEscrowStats(filter: any = {}) {
  const stats = await Escrow.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);
  
  return stats.reduce((acc: any, stat: any) => {
    acc[stat._id] = {
      count: stat.count,
      totalAmount: stat.totalAmount
    };
    return acc;
  }, {});
}

/**
 * Gets total escrow amount by status
 * @param {string} status - The status to filter by
 * @returns {Promise<number>} Total amount in escrow for the status
 */
export async function getTotalEscrowAmount(status: string | null = null) {
  const filter = status ? { status } : {};
  
  const result = await Escrow.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);
  
  return result[0]?.totalAmount || 0;
}

/**
 * Creates escrow for an order (used by order service)
 * @param {Object} escrowData - The escrow data
 * @param {Object} [session] - Database session for transactions
 * @returns {Promise<Escrow>} The created escrow
 */
export async function createEscrowForOrder(escrowData: any, session?: any) {
  const escrow = new Escrow(escrowData);
  return await escrow.save({ session });
}

/**
 * Releases escrow funds for an order (used by order service)
 * @param {string} orderId - The order id
 * @param {Object} [session] - Database session for transactions
 * @returns {Promise<Escrow>} The updated escrow
 */
export async function releaseEscrowForOrder(orderId: string, session?: any) {
  const escrow = await getEscrowByOrderId(orderId);
  if (!escrow) {
    throw new Error("Escrow not found for order");
  }
  
  return await updateEscrow(escrow._id, {
    status: "released_to_vendor",
    releasedAt: new Date(),
    updatedAt: new Date()
  }, { session });
}

/**
 * Refunds escrow funds for an order (used by order service)
 * @param {string} orderId - The order id
 * @param {Object} [session] - Database session for transactions
 * @returns {Promise<Escrow>} The updated escrow
 */
export async function refundEscrowForOrder(orderId: string, session?: any) {
  const escrow = await getEscrowByOrderId(orderId);
  if (!escrow) {
    throw new Error("Escrow not found for order");
  }
  
  return await updateEscrow(escrow._id, {
    status: "refunded_to_buyer",
    releasedAt: new Date(),
    updatedAt: new Date()
  }, { session });
}

/**
 * Gets escrow by order and vendor
 * @param {string} orderId - The order id
 * @param {string} vendorId - The vendor id
 * @returns {Promise<Escrow>} The escrow
 */
export async function getEscrowByOrderAndVendor(orderId: string, vendorId: string) {
  return await Escrow.findOne({ orderId, vendorId })
    .populate("orderId")
    .populate("buyerId", "name email")
    .populate("vendorId");
}

/**
 * Gets escrow analytics for admin dashboard
 * @param {Object} [filter] - Filter criteria
 * @returns {Promise<Object>} Escrow analytics
 */
export async function getEscrowAnalytics(filter: any = {}) {
  const [
    totalEscrows,
    pendingEscrows,
    pendingConfirmationEscrows,
    releasedEscrows,
    refundedEscrows,
    totalAmount,
    pendingAmount
  ] = await Promise.all([
    countEscrows(filter),
    countEscrows({ ...filter, status: "pending" }),
    countEscrows({ ...filter, status: "pending_confirmation" }),
    countEscrows({ ...filter, status: "released_to_vendor" }),
    countEscrows({ ...filter, status: "refunded_to_buyer" }),
    getTotalEscrowAmount(),
    getTotalEscrowAmount("pending")
  ]);

  return {
    totalEscrows,
    pendingEscrows,
    pendingConfirmationEscrows,
    releasedEscrows,
    refundedEscrows,
    totalAmount,
    pendingAmount,
    releaseRate: totalEscrows > 0 ? (releasedEscrows / totalEscrows * 100).toFixed(2) : "0.00",
    refundRate: totalEscrows > 0 ? (refundedEscrows / totalEscrows * 100).toFixed(2) : "0.00"
  };
}