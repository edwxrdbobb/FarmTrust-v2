//@ts-check
import Address from "@/models/address_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new address
 * @param {Object} data - The data for the address
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Address>} The created address
 */
export async function createAddress(data: any, options: any = {}) {
  const address = new Address(data);
  return await address.save(options);
}

/**
 * Gets an address by its id
 * @param {string} id - The id of the address
 * @returns {Promise<Address>} The address with populated user data
 */
export async function getAddressById(id: string) {
  return await Address.findById(id).populate("userId", "name email");
}

/**
 * Gets addresses by user id
 * @param {string} userId - The user id
 * @returns {Promise<Address[]>} Array of addresses for the user
 */
export async function getAddressesByUserId(userId: string) {
  return await Address.find({ userId })
    .populate("userId", "name email")
    .sort({ isDefault: -1, createdAt: -1 });
}

/**
 * Gets default address for a user
 * @param {string} userId - The user id
 * @returns {Promise<Address>} The default address
 */
export async function getDefaultAddressByUserId(userId: string) {
  return await Address.findOne({ userId, isDefault: true })
    .populate("userId", "name email");
}

/**
 * Gets addresses by type
 * @param {string} userId - The user id
 * @param {string} type - The address type (home, work, other)
 * @returns {Promise<Address[]>} Array of addresses with the specified type
 */
export async function getAddressesByType(userId: string, type: string) {
  return await Address.find({ userId, type })
    .populate("userId", "name email")
    .sort({ isDefault: -1, createdAt: -1 });
}

/**
 * Gets all addresses with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Address[]>} Array of addresses with populated data
 */
export async function getAddresses(filter: any = {}, options: QueryOptions = {}) {
  let query = Address.find(filter).populate("userId", "name email");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Updates an address
 * @param {string} id - The id of the address
 * @param {Object} data - The data to update the address with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Address>} The updated address
 */
export async function updateAddress(id: string, data: any, options: any = {}) {
  return await Address.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("userId", "name email");
}

/**
 * Sets an address as default and unsets others
 * @param {string} id - The id of the address to set as default
 * @param {string} userId - The user id
 * @returns {Promise<Address>} The updated address
 */
export async function setDefaultAddress(id: string, userId: string) {
  // First, unset all default addresses for the user
  await Address.updateMany(
    { userId, isDefault: true },
    { isDefault: false }
  );
  
  // Then set the specified address as default
  return await updateAddress(id, { isDefault: true });
}

/**
 * Deletes an address by its id
 * @param {string} id - The id of the address
 * @returns {Promise<Address>} The deleted address
 */
export async function deleteAddress(id: string) {
  return await Address.findByIdAndDelete(id);
}

/**
 * Deletes all addresses for a user
 * @param {string} userId - The user id
 * @returns {Promise<Object>} The delete result
 */
export async function deleteAddressesByUserId(userId: string) {
  return await Address.deleteMany({ userId });
}

/**
 * Counts addresses for a user
 * @param {string} userId - The user id
 * @returns {Promise<number>} The count of addresses
 */
export async function countAddressesByUserId(userId: string) {
  return await Address.countDocuments({ userId });
}

/**
 * Counts total addresses
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of addresses
 */
export async function countAddresses(filter: any = {}) {
  return await Address.countDocuments(filter);
}

/**
 * Validates if address belongs to user
 * @param {string} addressId - The address id
 * @param {string} userId - The user id
 * @returns {Promise<boolean>} True if address belongs to user
 */
export async function validateAddressOwnership(addressId: string, userId: string) {
  const address = await Address.findOne({ _id: addressId, userId });
  return !!address;
}

/**
 * Gets addresses by city
 * @param {string} city - The city name
 * @returns {Promise<Address[]>} Array of addresses in the city
 */
export async function getAddressesByCity(city: string) {
  return await Address.find({ city: new RegExp(city, 'i') })
    .populate("userId", "name email");
}

/**
 * Gets addresses by state
 * @param {string} state - The state name
 * @returns {Promise<Address[]>} Array of addresses in the state
 */
export async function getAddressesByState(state: string) {
  return await Address.find({ state: new RegExp(state, 'i') })
    .populate("userId", "name email");
}