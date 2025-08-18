import * as notificationRepo from "@/repositories/notification_repo";
import * as userRepo from "@/repositories/user_repo";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

export interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: "order" | "payment" | "shipping" | "review" | "dispute" | "vendor_approval" | "product" | "system" | "promotion" | "reminder";
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
}

export async function createNotification(data: CreateNotificationData, session?: any) {
  try {
    // Validate recipient exists
    const user = await userRepo.getUserById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const notificationData = {
      user: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      priority: data.priority || "medium" as const,
      isRead: false,
      actionUrl: data.actionUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await notificationRepo.createNotification(notificationData);
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function createBulkNotifications(notifications: CreateNotificationData[], session?: any) {
  try {
    const validatedNotifications = [];
    
    for (const data of notifications) {
      // Validate recipient exists
      const user = await userRepo.getUserById(data.userId);
      if (user) {
        validatedNotifications.push({
          user: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority || "medium" as const,
          isRead: false,
          actionUrl: data.actionUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    if (validatedNotifications.length === 0) {
      throw new Error('No valid recipients found');
    }

    return await notificationRepo.createBulkNotifications(validatedNotifications);
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}

export async function getNotificationsByUser(userId: string, options: any = {}) {
  try {
    return await notificationRepo.getNotificationsByUserId(userId, options);
  } catch (error) {
    console.error('Error getting notifications by user:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const notification = await notificationRepo.getNotificationById(notificationId);
    if (!notification) {
      return { success: false, error: "Notification not found" };
    }

    if (notification.recipient.toString() !== userId) {
      return { success: false, error: "Unauthorized to mark this notification as read" };
    }

    if (notification.isRead) {
      return { success: true, data: notification };
    }

    const updatedNotification = await notificationRepo.updateNotification(notificationId, {
      isRead: true,
      readAt: new Date(),
      updatedAt: new Date()
    }, session);

    await commitTransaction(session);
    return { success: true, data: updatedNotification };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error marking notification as read:", error);
    return { success: false, error: "Failed to mark notification as read" };
  }
}

export async function markAllAsReadForUser(userId: string) {
  try {
    return await notificationRepo.markAllNotificationsAsRead(userId);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

export async function deleteNotification(notificationId: string, userId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const notification = await notificationRepo.getNotificationById(notificationId);
    if (!notification) {
      return { success: false, error: "Notification not found" };
    }

    if (notification.recipient.toString() !== userId) {
      return { success: false, error: "Unauthorized to delete this notification" };
    }

    await notificationRepo.deleteNotification(notificationId);
    await commitTransaction(session);

    return { success: true, message: "Notification deleted successfully" };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error deleting notification:", error);
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function getUnreadCountForUser(userId: string) {
  try {
    return await notificationRepo.getUnreadNotificationsCount(userId);
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
}

// Specific notification creators for common scenarios
export async function notifyOrderCreated(orderId: string, buyerId: string, vendorId: string) {
  try {
    const notifications = [
      {
        userId: buyerId,
        title: "New Order Received",
        message: "You have received a new order.",
        type: "order" as const,
        priority: "high" as const
      },
      {
        userId: vendorId,
        title: "New Order Received",
        message: "You have received a new order.",
        type: "order" as const,
        priority: "high" as const
      }
    ];

    return await createBulkNotifications(notifications);
  } catch (error) {
    console.error("Error notifying order created:", error);
    return { success: false, error: "Failed to send order notifications" };
  }
}

export async function notifyOrderStatusUpdate(orderId: string, buyerId: string, status: string) {
  try {
    const statusMessages: { [key: string]: string } = {
      confirmed: "Your order has been confirmed by the vendor.",
      processing: "Your order is being prepared for shipment.",
      shipped: "Your order has been shipped and is on its way.",
      delivered: "Your order has been delivered successfully.",
      cancelled: "Your order has been cancelled."
    };

    const notification = {
      userId: buyerId,
      title: "Order Status Update",
      message: statusMessages[status] || "Your order status has been updated.",
      type: "order" as const,
      priority: "medium" as const
    };

    return await createNotification(notification);
  } catch (error) {
    console.error("Error notifying order status update:", error);
    return { success: false, error: "Failed to send order status notification" };
  }
}

export async function notifyLowStock(vendorId: string, productId: string, productName: string, currentStock: number) {
  try {
    const notification = {
      userId: vendorId,
      title: "Low Stock Alert",
      message: `Your product "${productName}" is running low on stock (${currentStock} remaining).`,
      type: "product" as const,
      priority: "high" as const
    };

    return await createNotification(notification);
  } catch (error) {
    console.error("Error notifying low stock:", error);
    return { success: false, error: "Failed to send low stock notification" };
  }
}

export async function notifyVendorVerification(vendorId: string, isApproved: boolean) {
  try {
    const notification = {
      userId: vendorId,
      title: isApproved ? "Vendor Account Verified" : "Vendor Account Suspended",
      message: isApproved 
        ? "Congratulations! Your vendor account has been verified and you can now start selling."
        : "Your vendor account has been suspended. Please contact support for more information.",
      type: "vendor_approval" as const,
      priority: "high" as const
    };

    return await createNotification(notification);
  } catch (error) {
    console.error("Error notifying vendor verification:", error);
    return { success: false, error: "Failed to send vendor verification notification" };
  }
}

export async function notifyFarmerRequestStatus(userId: string, requestId: string, status: string) {
  try {
    const statusMessages: { [key: string]: string } = {
      approved: "Your farmer verification request has been approved!",
      rejected: "Your farmer verification request has been rejected. Please review the requirements and try again."
    };

    const notification = {
      userId: userId,
      title: "Farmer Request Update",
      message: statusMessages[status] || "Your farmer request status has been updated.",
      type: status === 'approved' ? "vendor_approval" as const : "system" as const,
      priority: "high" as const
    };

    return await createNotification(notification);
  } catch (error) {
    console.error("Error notifying farmer request status:", error);
    return { success: false, error: "Failed to send farmer request notification" };
  }
}

/**
 * Creates a farmer request status notification
 * @param {string} userId - The user ID
 * @param {string} status - The request status
 * @param {string} requestId - The request ID
 * @returns {Promise<Object>} Created notification
 */
export async function createFarmerRequestStatusNotification(userId: string, status: string, requestId: string) {
  const statusMessages = {
    approved: "Your farmer request has been approved! You can now start selling your products.",
    rejected: "Your farmer request has been rejected. Please review the feedback and try again.",
    pending: "Your farmer request is under review. We'll notify you once a decision is made."
  };

  const message = statusMessages[status as keyof typeof statusMessages] || "Your farmer request status has been updated.";

  return await createNotification({
    userId,
    title: `Farmer Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message,
    type: "vendor_approval",
    priority: status === "approved" ? "high" : "medium",
    actionUrl: `/vendor/onboarding?requestId=${requestId}`
  });
}

export async function deleteOldNotifications(daysOld: number = 30) {
  try {
    return await notificationRepo.deleteOldReadNotifications(daysOld);
  } catch (error) {
    console.error('Error deleting old notifications:', error);
    throw error;
  }
}