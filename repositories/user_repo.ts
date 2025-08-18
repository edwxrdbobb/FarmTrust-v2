//@ts-check
import User from "@/models/user_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new user
 * @param {Object} data - The data for the user
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<User>} The created user
 */
export async function createUser(data: any, options: any = {}) {
  const user = new User(data);
  return await user.save(options);
}

/**
 * Gets a user by its id
 * @param {string} id - The id of the user
 * @returns {Promise<User>} The user
 */
export async function getUserById(id: string) {
  return await User.findById(id);
}

/**
 * Gets a user by email
 * @param {string} email - The email of the user
 * @returns {Promise<User>} The user
 */
export async function getUserByEmail(email: string) {
  return await User.findOne({ email });
}

/**
 * Gets all users with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<User[]>} Array of users
 */
export async function getUsers(filter: any = {}) {
  return await User.find(filter);
}

/**
 * Updates a user
 * @param {string} id - The id of the user
 * @param {Object} data - The data to update the user with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<User>} The updated user
 */
export async function updateUser(id: string, data: any, options: any = {}) {
  return await User.findByIdAndUpdate(id, data, { new: true, ...options });
}

/**
 * Deletes a user by its id
 * @param {string} id - The id of the user
 * @returns {Promise<User>} The deleted user
 */
export async function deleteUser(id: string) {
  return await User.findByIdAndDelete(id);
}

/**
 * Gets users by role
 * @param {string} role - The role to filter by
 * @returns {Promise<User[]>} Array of users with the specified role
 */
export async function getUsersByRole(role: string) {
  return await User.find({ role });
}

/**
 * Counts total users
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of users
 */
export async function countUsers(filter: any = {}) {
  return await User.countDocuments(filter);
}

/**
 * Counts users by date range
 * @param {Date} [startDate] - The start date
 * @param {Date} [endDate] - The end date
 * @returns {Promise<number>} The count of users
 */
export async function countUsersByDateRange(startDate?: Date, endDate?: Date) {
  const filter: any = {};
  if (startDate && endDate) {
    filter.createdAt = { $gte: startDate, $lte: endDate };
  }
  return countUsers(filter);
}

/**
 * Gets user growth data
 * @returns {Promise<Array>} User growth data
 */
export async function getUserGrowth() {
  // This would need aggregation to get user growth over time
  return [];
}