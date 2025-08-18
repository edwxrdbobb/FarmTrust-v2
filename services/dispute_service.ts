import * as disputeRepo from "@/repositories/dispute_repo";
import * as orderRepo from "@/repositories/order_repo";
import * as userRepo from "@/repositories/user_repo";
import * as vendorRepo from "@/repositories/vendor_repo";
import * as escrowRepo from "@/repositories/escrow_repo";
import * as notificationService from "./notification_service";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

export interface CreateDisputeData {
  order: string;
  type: DisputeType;
  reason: string;
  description: string;
  evidence?: string[];
  requestedResolution: string;
  requestedAmount?: number;
}

export interface UpdateDisputeData {
  status?: DisputeStatus;
  adminNotes?: string;
  resolution?: string;
  resolutionAmount?: number;
  evidence?: string[];
}

export interface DisputeResponseData {
  response: string;
  evidence?: string[];
}

export enum DisputeType {
  PRODUCT_QUALITY = 'product_quality',
  DELIVERY_ISSUE = 'delivery_issue',
  WRONG_ITEM = 'wrong_item',
  DAMAGED_ITEM = 'damaged_item',
  NOT_DELIVERED = 'not_delivered',
  PAYMENT_ISSUE = 'payment_issue',
  VENDOR_MISCONDUCT = 'vendor_misconduct',
  BUYER_MISCONDUCT = 'buyer_misconduct',
  OTHER = 'other'
}

export enum DisputeStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  AWAITING_RESPONSE = 'awaiting_response',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated'
}

export enum DisputePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export async function createDispute(userId: string, disputeData: CreateDisputeData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate user
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate order
    const order = await orderRepo.getOrderById(disputeData.order);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Check if user is involved in the order
    const isInvolved = order.user.toString() === userId || 
                      order.vendor.toString() === userId;
    if (!isInvolved) {
      return { success: false, error: "Unauthorized to dispute this order" };
    }

    // Check if dispute already exists for this order
    const existingDispute = await disputeRepo.getDisputeByOrder(disputeData.order);
    if (existingDispute && existingDispute.status !== DisputeStatus.CLOSED) {
      return { success: false, error: "Active dispute already exists for this order" };
    }

    // Determine dispute priority based on type and amount
    const priority = determineDisputePriority(disputeData.type, order.totalAmount, disputeData.requestedAmount);

    // Determine respondent
    const respondent = order.user.toString() === userId ? 
                      order.vendor.toString() : order.user.toString();

    // Create dispute
    const dispute = await disputeRepo.createDispute({
      order: disputeData.order,
      complainant: userId,
      respondent,
      type: disputeData.type,
      reason: disputeData.reason,
      description: disputeData.description,
      evidence: disputeData.evidence || [],
      requestedResolution: disputeData.requestedResolution,
      requestedAmount: disputeData.requestedAmount,
      status: DisputeStatus.PENDING,
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Update order status
    await orderRepo.updateOrder(disputeData.order, {
      status: 'disputed',
      updatedAt: new Date()
    }, session);

    // Update escrow status if exists
    const escrow = await escrowRepo.getEscrowByOrder(disputeData.order);
    if (escrow) {
      await escrowRepo.updateEscrow(escrow._id.toString(), {
        status: 'disputed',
        updatedAt: new Date()
      }, session);
    }

    // Send notifications
    await notificationService.createNotification({
      user: userId,
      title: 'Dispute Created',
      message: `Your dispute for order #${disputeData.order} has been submitted and is under review.`,
      type: 'dispute',
      relatedId: dispute._id.toString(),
      relatedModel: 'Dispute'
    });

    await notificationService.createNotification({
      user: respondent,
      title: 'Dispute Received',
      message: `A dispute has been filed against order #${disputeData.order}. Please respond within 48 hours.`,
      type: 'dispute',
      relatedId: dispute._id.toString(),
      relatedModel: 'Dispute'
    });

    await commitTransaction(session);
    return { success: true, data: dispute };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error creating dispute:", error);
    return { success: false, error: "Failed to create dispute" };
  }
}

export async function respondToDispute(disputeId: string, userId: string, responseData: DisputeResponseData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const dispute = await disputeRepo.getDisputeById(disputeId);
    if (!dispute) {
      return { success: false, error: "Dispute not found" };
    }

    // Check if user is the respondent
    if (dispute.respondent.toString() !== userId) {
      return { success: false, error: "Unauthorized to respond to this dispute" };
    }

    if (dispute.status !== DisputeStatus.PENDING && dispute.status !== DisputeStatus.AWAITING_RESPONSE) {
      return { success: false, error: "Cannot respond to dispute in current status" };
    }

    // Update dispute with response
    const updatedDispute = await disputeRepo.updateDisputeById(disputeId, {
      respondentResponse: responseData.response,
      respondentEvidence: responseData.evidence || [],
      respondedAt: new Date(),
      status: DisputeStatus.UNDER_REVIEW,
      updatedAt: new Date()
    }, session);

    // Send notifications
    await notificationService.createNotification({
      user: dispute.complainant.toString(),
      title: 'Dispute Response Received',
      message: `The other party has responded to your dispute. The case is now under review.`,
      type: 'dispute',
      relatedId: disputeId,
      relatedModel: 'Dispute'
    });

    await commitTransaction(session);
    return { success: true, data: updatedDispute };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error responding to dispute:", error);
    return { success: false, error: "Failed to respond to dispute" };
  }
}

export async function updateDisputeStatus(disputeId: string, adminId: string, updateData: UpdateDisputeData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const dispute = await disputeRepo.getDisputeById(disputeId);
    if (!dispute) {
      return { success: false, error: "Dispute not found" };
    }

    // Validate admin user
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Update dispute
    const updatedDispute = await disputeRepo.updateDisputeById(disputeId, {
      ...updateData,
      assignedAdmin: adminId,
      updatedAt: new Date()
    }, session);

    // Handle status-specific actions
    if (updateData.status === DisputeStatus.RESOLVED) {
      await handleDisputeResolution(dispute, updateData, session);
    }

    // Send notifications
    await notificationService.createNotification({
      user: dispute.complainant.toString(),
      title: 'Dispute Update',
      message: `Your dispute status has been updated to: ${updateData.status}`,
      type: 'dispute',
      relatedId: disputeId,
      relatedModel: 'Dispute'
    });

    await notificationService.createNotification({
      user: dispute.respondent.toString(),
      title: 'Dispute Update',
      message: `Dispute status has been updated to: ${updateData.status}`,
      type: 'dispute',
      relatedId: disputeId,
      relatedModel: 'Dispute'
    });

    await commitTransaction(session);
    return { success: true, data: updatedDispute };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating dispute status:", error);
    return { success: false, error: "Failed to update dispute status" };
  }
}

export async function getDisputeById(disputeId: string, userId?: string) {
  try {
    await connectDB();
    const dispute = await disputeRepo.getDisputeById(disputeId);
    
    if (!dispute) {
      return { success: false, error: "Dispute not found" };
    }

    // Check access permissions
    if (userId) {
      const user = await userRepo.getUserById(userId);
      const hasAccess = user?.role === 'admin' || 
                       dispute.complainant.toString() === userId || 
                       dispute.respondent.toString() === userId;
      
      if (!hasAccess) {
        return { success: false, error: "Unauthorized to view this dispute" };
      }
    }

    return { success: true, data: dispute };
  } catch (error) {
    console.error("Error fetching dispute:", error);
    return { success: false, error: "Failed to fetch dispute" };
  }
}

export async function getUserDisputes(userId: string, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const disputes = await disputeRepo.getDisputesByBuyerId(userId, page, limit);
    return { success: true, data: disputes };
  } catch (error) {
    console.error("Error fetching user disputes:", error);
    return { success: false, error: "Failed to fetch disputes" };
  }
}

export async function getVendorDisputes(vendorId: string, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    
    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    const disputes = await disputeRepo.getDisputesByVendorId(vendorId, page, limit);
    return { success: true, data: disputes };
  } catch (error) {
    console.error("Error fetching vendor disputes:", error);
    return { success: false, error: "Failed to fetch disputes" };
  }
}

export async function getAllDisputes(adminId: string, filters?: any, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    
    // Validate admin
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    const disputes = await disputeRepo.getDisputes(filters, page, limit);
    return { success: true, data: disputes };
  } catch (error) {
    console.error("Error fetching all disputes:", error);
    return { success: false, error: "Failed to fetch disputes" };
  }
}

export async function getDisputeStats(adminId?: string, userId?: string, vendorId?: string) {
  try {
    await connectDB();
    
    // Validate admin access for global stats
    if (adminId) {
      const admin = await userRepo.getUserById(adminId);
      if (!admin || admin.role !== 'admin') {
        return { success: false, error: "Unauthorized - Admin access required" };
      }
    }

    let stats;
    if (userId) {
      stats = await disputeRepo.getDisputeStatsByUser(userId);
    } else if (vendorId) {
      stats = await disputeRepo.getDisputeStatsByVendor(vendorId);
    } else {
      stats = await disputeRepo.getGlobalDisputeStats();
    }

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching dispute stats:", error);
    return { success: false, error: "Failed to fetch dispute statistics" };
  }
}

export async function escalateDispute(disputeId: string, adminId: string, escalationReason: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const dispute = await disputeRepo.getDisputeById(disputeId);
    if (!dispute) {
      return { success: false, error: "Dispute not found" };
    }

    // Validate admin
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Update dispute
    const updatedDispute = await disputeRepo.updateDisputeById(disputeId, {
      status: DisputeStatus.ESCALATED,
      priority: DisputePriority.HIGH,
      escalatedBy: adminId,
      escalationReason,
      escalatedAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Send notifications
    await notificationService.createNotification({
      user: dispute.complainant.toString(),
      title: 'Dispute Escalated',
      message: 'Your dispute has been escalated for senior review.',
      type: 'dispute',
      relatedId: disputeId,
      relatedModel: 'Dispute'
    });

    await notificationService.createNotification({
      user: dispute.respondent.toString(),
      title: 'Dispute Escalated',
      message: 'The dispute has been escalated for senior review.',
      type: 'dispute',
      relatedId: disputeId,
      relatedModel: 'Dispute'
    });

    await commitTransaction(session);
    return { success: true, data: updatedDispute };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error escalating dispute:", error);
    return { success: false, error: "Failed to escalate dispute" };
  }
}

export async function closeDispute(disputeId: string, adminId: string, closureReason: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const dispute = await disputeRepo.getDisputeById(disputeId);
    if (!dispute) {
      return { success: false, error: "Dispute not found" };
    }

    // Validate admin
    const admin = await userRepo.getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return { success: false, error: "Unauthorized - Admin access required" };
    }

    // Update dispute
    const updatedDispute = await disputeRepo.updateDisputeById(disputeId, {
      status: DisputeStatus.CLOSED,
      closedBy: adminId,
      closureReason,
      closedAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Send notifications
    await notificationService.createNotification({
      user: dispute.complainant.toString(),
      title: 'Dispute Closed',
      message: `Your dispute has been closed. Reason: ${closureReason}`,
      type: 'dispute',
      relatedId: disputeId,
      relatedModel: 'Dispute'
    });

    await notificationService.createNotification({
      user: dispute.respondent.toString(),
      title: 'Dispute Closed',
      message: `The dispute has been closed. Reason: ${closureReason}`,
      type: 'dispute',
      relatedId: disputeId,
      relatedModel: 'Dispute'
    });

    await commitTransaction(session);
    return { success: true, data: updatedDispute };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error closing dispute:", error);
    return { success: false, error: "Failed to close dispute" };
  }
}

// Helper functions
function determineDisputePriority(type: DisputeType, orderAmount: number, requestedAmount?: number): DisputePriority {
  // High priority for large amounts or serious issues
  if (orderAmount > 1000 || (requestedAmount && requestedAmount > 500)) {
    return DisputePriority.HIGH;
  }

  // High priority for serious misconduct
  if (type === DisputeType.VENDOR_MISCONDUCT || type === DisputeType.BUYER_MISCONDUCT) {
    return DisputePriority.HIGH;
  }

  // Medium priority for delivery and quality issues
  if (type === DisputeType.NOT_DELIVERED || type === DisputeType.PRODUCT_QUALITY) {
    return DisputePriority.MEDIUM;
  }

  // Default to low priority
  return DisputePriority.LOW;
}

async function handleDisputeResolution(dispute: any, updateData: UpdateDisputeData, session: any) {
  // Update order status based on resolution
  if (updateData.resolution?.includes('refund')) {
    await orderRepo.updateOrder(dispute.order.toString(), {
      status: 'refunded',
      updatedAt: new Date()
    }, session);

    // Handle escrow refund if applicable
    const escrow = await escrowRepo.getEscrowByOrder(dispute.order.toString());
    if (escrow) {
      await escrowRepo.updateEscrow(escrow._id.toString(), {
        status: 'refunded',
        refundedAmount: updateData.resolutionAmount || escrow.amount,
        refundedBy: 'admin',
        refundReason: 'Dispute resolution',
        refundedAt: new Date(),
        updatedAt: new Date()
      }, session);
    }
  } else if (updateData.resolution?.includes('release')) {
    await orderRepo.updateOrder(dispute.order.toString(), {
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Handle escrow release if applicable
    const escrow = await escrowRepo.getEscrowByOrder(dispute.order.toString());
    if (escrow) {
      await escrowRepo.updateEscrow(escrow._id.toString(), {
        status: 'released',
        releasedAmount: updateData.resolutionAmount || escrow.amount,
        releasedBy: 'admin',
        releaseReason: 'Dispute resolution',
        releasedAt: new Date(),
        updatedAt: new Date()
      }, session);
    }
  }
}