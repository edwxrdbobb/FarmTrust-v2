//@ts-check
import PaymentMethod from "@/models/payment_method_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new payment method
 * @param {Object} data - The data for the payment method
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<PaymentMethod>} The created payment method
 */
export async function createPaymentMethod(data: any, options: any = {}) {
  const paymentMethod = new PaymentMethod(data);
  return await paymentMethod.save(options);
}

/**
 * Gets a payment method by its id
 * @param {string} id - The id of the payment method
 * @returns {Promise<PaymentMethod>} The payment method with populated data
 */
export async function getPaymentMethodById(id: string) {
  return await PaymentMethod.findById(id)
    .populate("user", "name email role");
}

/**
 * Gets payment methods by user id
 * @param {string} userId - The user id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<PaymentMethod[]>} Array of payment methods for the user
 */
export async function getPaymentMethodsByUserId(userId: string, options: QueryOptions = {}) {
  let query = PaymentMethod.find({ user: userId })
    .populate("user", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets active payment methods by user id
 * @param {string} userId - The user id
 * @param {Object} [options] - Query options
 * @returns {Promise<PaymentMethod[]>} Array of active payment methods for the user
 */
export async function getActivePaymentMethodsByUserId(userId: string, options: QueryOptions = {}) {
  let query = PaymentMethod.find({ user: userId, isActive: true })
    .populate("user", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets default payment method for a user
 * @param {string} userId - The user id
 * @returns {Promise<PaymentMethod>} The default payment method
 */
export async function getDefaultPaymentMethod(userId: string) {
  return await PaymentMethod.findOne({ user: userId, isDefault: true, isActive: true })
    .populate("user", "name email role");
}

/**
 * Gets payment methods by type
 * @param {string} type - The payment method type
 * @param {Object} [options] - Query options
 * @returns {Promise<PaymentMethod[]>} Array of payment methods with the specified type
 */
export async function getPaymentMethodsByType(type: string, options: QueryOptions = {}) {
  let query = PaymentMethod.find({ type })
    .populate("user", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets payment methods by provider
 * @param {string} provider - The payment provider
 * @param {Object} [options] - Query options
 * @returns {Promise<PaymentMethod[]>} Array of payment methods with the specified provider
 */
export async function getPaymentMethodsByProvider(provider: string, options: QueryOptions = {}) {
  let query = PaymentMethod.find({ provider })
    .populate("user", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets payment method by external id
 * @param {string} externalId - The external payment method id
 * @param {string} [provider] - The payment provider
 * @returns {Promise<PaymentMethod>} The payment method
 */
export async function getPaymentMethodByExternalId(externalId: string, provider?: string) {
  const filter: any = { externalId };
  if (provider) filter.provider = provider;
  
  return await PaymentMethod.findOne(filter)
    .populate("user", "name email role");
}

/**
 * Gets all payment methods with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<PaymentMethod[]>} Array of payment methods with populated data
 */
export async function getPaymentMethods(filter: any = {}, options: QueryOptions = {}) {
  let query = PaymentMethod.find(filter)
    .populate("user", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets verified payment methods by user id
 * @param {string} userId - The user id
 * @param {Object} [options] - Query options
 * @returns {Promise<PaymentMethod[]>} Array of verified payment methods
 */
export async function getVerifiedPaymentMethods(userId: string, options: QueryOptions = {}) {
  let query = PaymentMethod.find({ user: userId, isVerified: true, isActive: true })
    .populate("user", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Updates a payment method
 * @param {string} id - The id of the payment method
 * @param {Object} data - The data to update the payment method with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<PaymentMethod>} The updated payment method
 */
export async function updatePaymentMethod(id: string, data: any, options: any = {}) {
  return await PaymentMethod.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("user", "name email role");
}

/**
 * Sets a payment method as default
 * @param {string} id - The id of the payment method
 * @param {string} userId - The user id
 * @returns {Promise<PaymentMethod>} The updated payment method
 */
export async function setAsDefaultPaymentMethod(id: string, userId: string) {
  // First, unset all other default payment methods for the user
  await PaymentMethod.updateMany(
    { user: userId, isDefault: true },
    { isDefault: false }
  );
  
  // Then set the specified payment method as default
  return await updatePaymentMethod(id, { isDefault: true });
}

/**
 * Activates a payment method
 * @param {string} id - The id of the payment method
 * @returns {Promise<PaymentMethod>} The updated payment method
 */
export async function activatePaymentMethod(id: string) {
  return await updatePaymentMethod(id, { isActive: true });
}

/**
 * Deactivates a payment method
 * @param {string} id - The id of the payment method
 * @returns {Promise<PaymentMethod>} The updated payment method
 */
export async function deactivatePaymentMethod(id: string) {
  return await updatePaymentMethod(id, { isActive: false, isDefault: false });
}

/**
 * Verifies a payment method
 * @param {string} id - The id of the payment method
 * @returns {Promise<PaymentMethod>} The updated payment method
 */
export async function verifyPaymentMethod(id: string) {
  return await updatePaymentMethod(id, {
    isVerified: true,
    verifiedAt: new Date()
  });
}

/**
 * Updates payment method metadata
 * @param {string} id - The id of the payment method
 * @param {Object} metadata - The metadata to update
 * @returns {Promise<PaymentMethod>} The updated payment method
 */
export async function updatePaymentMethodMetadata(id: string, metadata: any) {
  return await updatePaymentMethod(id, {
    $set: {
      "metadata": { ...metadata }
    }
  });
}

/**
 * Updates payment method last used timestamp
 * @param {string} id - The id of the payment method
 * @returns {Promise<PaymentMethod>} The updated payment method
 */
export async function updateLastUsed(id: string) {
  return await updatePaymentMethod(id, { lastUsedAt: new Date() });
}

/**
 * Deletes a payment method by its id
 * @param {string} id - The id of the payment method
 * @returns {Promise<PaymentMethod>} The deleted payment method
 */
export async function deletePaymentMethod(id: string) {
  return await PaymentMethod.findByIdAndDelete(id);
}

/**
 * Soft deletes a payment method (deactivates it)
 * @param {string} id - The id of the payment method
 * @returns {Promise<PaymentMethod>} The updated payment method
 */
export async function softDeletePaymentMethod(id: string) {
  return await deactivatePaymentMethod(id);
}

/**
 * Deletes all payment methods for a user
 * @param {string} userId - The user id
 * @returns {Promise<Object>} Delete result
 */
export async function deleteAllPaymentMethodsForUser(userId: string) {
  return await PaymentMethod.deleteMany({ user: userId });
}

/**
 * Counts total payment methods
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of payment methods
 */
export async function countPaymentMethods(filter: any = {}) {
  return await PaymentMethod.countDocuments(filter);
}

/**
 * Counts payment methods by user
 * @param {string} userId - The user id
 * @returns {Promise<number>} The count of payment methods
 */
export async function countPaymentMethodsByUser(userId: string) {
  return await PaymentMethod.countDocuments({ user: userId });
}

/**
 * Counts active payment methods by user
 * @param {string} userId - The user id
 * @returns {Promise<number>} The count of active payment methods
 */
export async function countActivePaymentMethodsByUser(userId: string) {
  return await PaymentMethod.countDocuments({ user: userId, isActive: true });
}

/**
 * Counts payment methods by type
 * @param {string} type - The payment method type
 * @returns {Promise<number>} The count of payment methods
 */
export async function countPaymentMethodsByType(type: string) {
  return await PaymentMethod.countDocuments({ type });
}

/**
 * Counts payment methods by provider
 * @param {string} provider - The payment provider
 * @returns {Promise<number>} The count of payment methods
 */
export async function countPaymentMethodsByProvider(provider: string) {
  return await PaymentMethod.countDocuments({ provider });
}

/**
 * Gets payment method statistics
 * @param {Object} [filter] - Additional filter criteria
 * @returns {Promise<Object>} Payment method statistics
 */
export async function getPaymentMethodStats(filter: any = {}) {
  const stats = await PaymentMethod.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalPaymentMethods: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ["$isActive", 1, 0] }
        },
        inactiveCount: {
          $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] }
        },
        verifiedCount: {
          $sum: { $cond: ["$isVerified", 1, 0] }
        },
        unverifiedCount: {
          $sum: { $cond: [{ $eq: ["$isVerified", false] }, 1, 0] }
        },
        defaultCount: {
          $sum: { $cond: ["$isDefault", 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalPaymentMethods: 0,
    activeCount: 0,
    inactiveCount: 0,
    verifiedCount: 0,
    unverifiedCount: 0,
    defaultCount: 0
  };
}

/**
 * Gets payment method statistics by type
 * @param {Object} [filter] - Additional filter criteria
 * @returns {Promise<Object[]>} Payment method statistics grouped by type
 */
export async function getPaymentMethodStatsByType(filter: any = {}) {
  return await PaymentMethod.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ["$isActive", 1, 0] }
        },
        verifiedCount: {
          $sum: { $cond: ["$isVerified", 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
}

/**
 * Gets payment method statistics by provider
 * @param {Object} [filter] - Additional filter criteria
 * @returns {Promise<Object[]>} Payment method statistics grouped by provider
 */
export async function getPaymentMethodStatsByProvider(filter: any = {}) {
  return await PaymentMethod.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$provider",
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: ["$isActive", 1, 0] }
        },
        verifiedCount: {
          $sum: { $cond: ["$isVerified", 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
}

/**
 * Validates if user owns the payment method
 * @param {string} paymentMethodId - The payment method id
 * @param {string} userId - The user id
 * @returns {Promise<boolean>} True if user owns the payment method
 */
export async function validatePaymentMethodOwnership(paymentMethodId: string, userId: string) {
  const paymentMethod = await PaymentMethod.findOne({
    _id: paymentMethodId,
    user: userId
  });
  
  return !!paymentMethod;
}

/**
 * Gets expired payment methods (for cleanup)
 * @param {Date} [expiryDate] - The expiry date to check against
 * @returns {Promise<PaymentMethod[]>} Array of expired payment methods
 */
export async function getExpiredPaymentMethods(expiryDate: Date = new Date()) {
  return await PaymentMethod.find({
    expiresAt: { $lt: expiryDate },
    isActive: true
  }).populate("user", "name email role");
}

/**
 * Deactivates expired payment methods
 * @param {Date} [expiryDate] - The expiry date to check against
 * @returns {Promise<Object>} Update result
 */
export async function deactivateExpiredPaymentMethods(expiryDate: Date = new Date()) {
  return await PaymentMethod.updateMany(
    {
      expiresAt: { $lt: expiryDate },
      isActive: true
    },
    {
      isActive: false,
      isDefault: false
    }
  );
}