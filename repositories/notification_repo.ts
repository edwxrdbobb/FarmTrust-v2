//@ts-check
import Notification from "@/models/notification_model";

interface QueryOptions {
  sort?: any;
  limit?: number;
  skip?: number;
}

/**
 * Creates a new notification
 * @param {Object} data - The data for the notification
 * @param {Object} [options] - The options for the save method
 * @returns {Promise<Notification>} The created notification
 */
export async function createNotification(data: any, options: any = {}) {
  const notification = new Notification(data);
  return await notification.save(options);
}

/**
 * Gets a notification by its id
 * @param {string} id - The id of the notification
 * @returns {Promise<Notification>} The notification with populated data
 */
export async function getNotificationById(id: string) {
  return await Notification.findById(id)
    .populate("user", "name email role")
    .populate("relatedUser", "name email role");
}

/**
 * Gets notifications by user id
 * @param {string} userId - The user id
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Notification[]>} Array of notifications for the user
 */
export async function getNotificationsByUserId(userId: string, options: QueryOptions = {}) {
  let query = Notification.find({ user: userId })
    .populate("user", "name email role")
    .populate("relatedUser", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets notifications by type
 * @param {string} type - The notification type
 * @param {Object} [options] - Query options
 * @returns {Promise<Notification[]>} Array of notifications with the specified type
 */
export async function getNotificationsByType(type: string, options: QueryOptions = {}) {
  let query = Notification.find({ type })
    .populate("user", "name email role")
    .populate("relatedUser", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets unread notifications for a user
 * @param {string} userId - The user id
 * @param {Object} [options] - Query options
 * @returns {Promise<Notification[]>} Array of unread notifications
 */
export async function getUnreadNotifications(userId: string, options: QueryOptions = {}) {
  let query = Notification.find({ user: userId, isRead: false })
    .populate("user", "name email role")
    .populate("relatedUser", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets unread notifications count for a user
 * @param {string} userId - The user id
 * @returns {Promise<number>} Count of unread notifications
 */
export async function getUnreadNotificationsCount(userId: string) {
  return await Notification.countDocuments({ user: userId, isRead: false });
}

/**
 * Gets read notifications for a user
 * @param {string} userId - The user id
 * @param {Object} [options] - Query options
 * @returns {Promise<Notification[]>} Array of read notifications
 */
export async function getReadNotifications(userId: string, options: QueryOptions = {}) {
  let query = Notification.find({ user: userId, isRead: true })
    .populate("user", "name email role")
    .populate("relatedUser", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets notifications by priority
 * @param {string} priority - The notification priority
 * @param {Object} [options] - Query options
 * @returns {Promise<Notification[]>} Array of notifications with the specified priority
 */
export async function getNotificationsByPriority(priority: string, options: QueryOptions = {}) {
  let query = Notification.find({ priority })
    .populate("user", "name email role")
    .populate("relatedUser", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets all notifications with optional filtering
 * @param {Object} [filter] - The filter criteria
 * @param {Object} [options] - Query options (sort, limit, skip)
 * @returns {Promise<Notification[]>} Array of notifications with populated data
 */
export async function getNotifications(filter: any = {}, options: QueryOptions = {}) {
  let query = Notification.find(filter)
    .populate("user", "name email role")
    .populate("relatedUser", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Gets recent notifications for a user
 * @param {string} userId - The user id
 * @param {number} [limit=20] - Number of recent notifications to fetch
 * @returns {Promise<Notification[]>} Array of recent notifications
 */
export async function getRecentNotifications(userId: string, limit: number = 20) {
  return await getNotificationsByUserId(userId, {
    sort: { createdAt: -1 },
    limit
  });
}

/**
 * Gets notifications by related entity
 * @param {string} relatedEntityType - The related entity type
 * @param {string} relatedEntityId - The related entity id
 * @param {Object} [options] - Query options
 * @returns {Promise<Notification[]>} Array of notifications for the related entity
 */
export async function getNotificationsByRelatedEntity(relatedEntityType: string, relatedEntityId: string, options: QueryOptions = {}) {
  let query = Notification.find({
    relatedEntityType,
    relatedEntityId
  })
    .populate("user", "name email role")
    .populate("relatedUser", "name email role");
    
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  if (options.skip) query = query.skip(options.skip);
  
  return await query;
}

/**
 * Updates a notification
 * @param {string} id - The id of the notification
 * @param {Object} data - The data to update the notification with
 * @param {Object} [options] - The options for the update method
 * @returns {Promise<Notification>} The updated notification
 */
export async function updateNotification(id: string, data: any, options: any = {}) {
  return await Notification.findByIdAndUpdate(id, data, { new: true, ...options })
    .populate("user", "name email role")
    .populate("relatedUser", "name email role");
}

/**
 * Marks a notification as read
 * @param {string} id - The id of the notification
 * @returns {Promise<Notification>} The updated notification
 */
export async function markNotificationAsRead(id: string) {
  return await updateNotification(id, {
    isRead: true,
    readAt: new Date()
  });
}

/**
 * Marks a notification as unread
 * @param {string} id - The id of the notification
 * @returns {Promise<Notification>} The updated notification
 */
export async function markNotificationAsUnread(id: string) {
  return await updateNotification(id, {
    isRead: false,
    readAt: null
  });
}

/**
 * Marks multiple notifications as read
 * @param {string[]} ids - Array of notification ids
 * @returns {Promise<Object>} Update result
 */
export async function markNotificationsAsRead(ids: string[]) {
  return await Notification.updateMany(
    { _id: { $in: ids } },
    {
      isRead: true,
      readAt: new Date()
    }
  );
}

/**
 * Marks all notifications as read for a user
 * @param {string} userId - The user id
 * @returns {Promise<Object>} Update result
 */
export async function markAllNotificationsAsRead(userId: string) {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    {
      isRead: true,
      readAt: new Date()
    }
  );
}

/**
 * Deletes a notification by its id
 * @param {string} id - The id of the notification
 * @returns {Promise<Notification>} The deleted notification
 */
export async function deleteNotification(id: string) {
  return await Notification.findByIdAndDelete(id);
}

/**
 * Deletes multiple notifications
 * @param {string[]} ids - Array of notification ids
 * @returns {Promise<Object>} Delete result
 */
export async function deleteNotifications(ids: string[]) {
  return await Notification.deleteMany({ _id: { $in: ids } });
}

/**
 * Deletes all notifications for a user
 * @param {string} userId - The user id
 * @returns {Promise<Object>} Delete result
 */
export async function deleteAllNotificationsForUser(userId: string) {
  return await Notification.deleteMany({ user: userId });
}

/**
 * Deletes old read notifications
 * @param {number} daysOld - Number of days old
 * @returns {Promise<Object>} Delete result
 */
export async function deleteOldReadNotifications(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await Notification.deleteMany({
    isRead: true,
    readAt: { $lt: cutoffDate }
  });
}

/**
 * Counts total notifications
 * @param {Object} [filter] - The filter criteria
 * @returns {Promise<number>} The count of notifications
 */
export async function countNotifications(filter: any = {}) {
  return await Notification.countDocuments(filter);
}

/**
 * Counts notifications by user
 * @param {string} userId - The user id
 * @returns {Promise<number>} The count of notifications
 */
export async function countNotificationsByUser(userId: string) {
  return await Notification.countDocuments({ user: userId });
}

/**
 * Counts notifications by type
 * @param {string} type - The notification type
 * @returns {Promise<number>} The count of notifications
 */
export async function countNotificationsByType(type: string) {
  return await Notification.countDocuments({ type });
}

/**
 * Gets notification statistics for a user
 * @param {string} userId - The user id
 * @returns {Promise<Object>} Notification statistics
 */
export async function getNotificationStatsForUser(userId: string) {
  const stats = await Notification.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
        },
        readCount: {
          $sum: { $cond: [{ $eq: ["$isRead", true] }, 1, 0] }
        },
        highPriorityCount: {
          $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] }
        },
        mediumPriorityCount: {
          $sum: { $cond: [{ $eq: ["$priority", "medium"] }, 1, 0] }
        },
        lowPriorityCount: {
          $sum: { $cond: [{ $eq: ["$priority", "low"] }, 1, 0] }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalNotifications: 0,
    unreadCount: 0,
    readCount: 0,
    highPriorityCount: 0,
    mediumPriorityCount: 0,
    lowPriorityCount: 0
  };
}

/**
 * Gets notification statistics by type
 * @param {Object} [filter] - Additional filter criteria
 * @returns {Promise<Object[]>} Notification statistics grouped by type
 */
export async function getNotificationStatsByType(filter: any = {}) {
  return await Notification.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
        },
        readCount: {
          $sum: { $cond: [{ $eq: ["$isRead", true] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
}

/**
 * Creates bulk notifications
 * @param {Object[]} notifications - Array of notification data
 * @returns {Promise<Notification[]>} Array of created notifications
 */
export async function createBulkNotifications(notifications: any[]) {
  return await Notification.insertMany(notifications);
}

/**
 * Gets notifications that need to be sent (for push notifications, emails, etc.)
 * @param {Object} [filter] - Additional filter criteria
 * @returns {Promise<Notification[]>} Array of notifications to be sent
 */
export async function getNotificationsToSend(filter: any = {}) {
  return await Notification.find({
    isSent: false,
    ...filter
  })
    .populate("user", "name email role deviceTokens notificationSettings")
    .populate("relatedUser", "name email role");
}

/**
 * Marks notifications as sent
 * @param {string[]} ids - Array of notification ids
 * @returns {Promise<Object>} Update result
 */
export async function markNotificationsAsSent(ids: string[]) {
  return await Notification.updateMany(
    { _id: { $in: ids } },
    {
      isSent: true,
      sentAt: new Date()
    }
  );
}