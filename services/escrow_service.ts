import * as escrowRepo from "@/repositories/escrow_repo";
import * as orderRepo from "@/repositories/order_repo";
import * as userRepo from "@/repositories/user_repo";
import * as vendorRepo from "@/repositories/vendor_repo";
import * as notificationService from "./notification_service";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

export interface CreateEscrowData {
  order: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentReference?: string;
}

export interface ReleaseEscrowData {
  escrowId: string;
  releaseAmount?: number;
  releaseReason?: string;
}

export interface RefundEscrowData {
  escrowId: string;
  refundAmount?: number;
  refundReason: string;
}

export enum EscrowStatus {
  PENDING = 'pending',
  FUNDED = 'funded',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled'
}

export enum EscrowType {
  ORDER_PAYMENT = 'order_payment',
  DEPOSIT = 'deposit',
  SECURITY = 'security'
}

export async function createEscrow(buyerId: string, escrowData: CreateEscrowData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate buyer
    const buyer = await userRepo.getUserById(buyerId);
    if (!buyer) {
      return { success: false, error: "Buyer not found" };
    }

    // Validate order
    const order = await orderRepo.getOrderById(escrowData.order);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.user.toString() !== buyerId) {
      return { success: false, error: "Unauthorized to create escrow for this order" };
    }

    // Check if escrow already exists for this order
    const existingEscrow = await escrowRepo.getEscrowByOrderId(escrowData.order);
    if (existingEscrow) {
      return { success: false, error: "Escrow already exists for this order" };
    }

    // Validate amount matches order total
    if (escrowData.amount !== order.totalAmount) {
      return { success: false, error: "Escrow amount must match order total" };
    }

    // Get vendor from order
    const vendorId = order.vendor.toString();
    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    // Create escrow
    const escrow = await escrowRepo.createEscrow({
      orderId: escrowData.order,
      buyerId: buyerId,
      vendorId: vendorId,
      amount: escrowData.amount,
      currency: escrowData.currency,
      status: EscrowStatus.PENDING,
      type: EscrowType.ORDER_PAYMENT,
      paymentMethod: escrowData.paymentMethod,
      paymentReference: escrowData.paymentReference,
      createdAt: new Date(),
      updatedAt: new Date()
    }, { session });

    // Update order status
    await orderRepo.updateOrderById(escrowData.order, {
      status: 'payment_pending',
      escrow: escrow._id,
      updatedAt: new Date()
    }, { session });

    // Send notifications
    await notificationService.createNotification({
      userId: buyerId,
      title: "Escrow Created",
      message: "Escrow created - Payment pending",
      type: "payment",
      priority: "medium"
    });

    await notificationService.createNotification({
      userId: vendorId,
      title: "New Order Received",
      message: "New order received - Payment pending",
      type: "order",
      priority: "medium"
    });

    await commitTransaction(session);
    return { success: true, data: escrow };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error creating escrow:", error);
    return { success: false, error: "Failed to create escrow" };
  }
}

export async function fundEscrow(escrowId: string, paymentReference: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const escrow = await escrowRepo.getEscrowById(escrowId);
    if (!escrow) {
      return { success: false, error: "Escrow not found" };
    }

    if (escrow.status !== EscrowStatus.PENDING) {
      return { success: false, error: "Escrow is not in pending status" };
    }

    // Update escrow status
    const updatedEscrow = await escrowRepo.updateEscrow(escrowId, {
      status: EscrowStatus.FUNDED,
      paymentReference,
      fundedAt: new Date(),
      updatedAt: new Date()
    }, { session });

    // Update order status
    await orderRepo.updateOrderById(escrow.orderId.toString(), {
      status: 'confirmed',
      updatedAt: new Date()
    }, { session });

    // Send notifications
    await notificationService.createNotification({
      userId: escrow.buyerId.toString(),
      title: "Payment Confirmed",
      message: "Payment confirmed - Order processing",
      type: "payment",
      priority: "medium"
    });

    await notificationService.createNotification({
      userId: escrow.vendorId.toString(),
      title: "Payment Received",
      message: "Payment received - Please process order",
      type: "payment",
      priority: "medium"
    });

    await commitTransaction(session);
    return { success: true, data: updatedEscrow };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error funding escrow:", error);
    return { success: false, error: "Failed to fund escrow" };
  }
}

export async function releaseEscrow(releaseData: ReleaseEscrowData, releasedBy: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const escrow = await escrowRepo.getEscrowById(releaseData.escrowId);
    if (!escrow) {
      return { success: false, error: "Escrow not found" };
    }

    if (escrow.status !== EscrowStatus.FUNDED) {
      return { success: false, error: "Escrow is not funded" };
    }

    // Validate release authority
    const canRelease = escrow.buyerId.toString() === releasedBy || 
                      escrow.vendorId.toString() === releasedBy;
    if (!canRelease) {
      return { success: false, error: "Unauthorized to release escrow" };
    }

    const releaseAmount = releaseData.releaseAmount || escrow.amount;
    
    if (releaseAmount > escrow.amount) {
      return { success: false, error: "Release amount cannot exceed escrow amount" };
    }

    // Update escrow
    const updatedEscrow = await escrowRepo.updateEscrow(releaseData.escrowId, {
      status: EscrowStatus.RELEASED,
      releasedAmount: releaseAmount,
      releasedBy,
      releaseReason: releaseData.releaseReason,
      releasedAt: new Date(),
      updatedAt: new Date()
    }, { session });

    // Update order status
    await orderRepo.updateOrderById(escrow.orderId.toString(), {
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date()
    }, { session });

    // Send notifications
    await notificationService.createNotification({
      userId: escrow.buyerId.toString(),
      title: "Order Completed",
      message: "Order completed - Payment released to vendor",
      type: "order",
      priority: "medium"
    });

    await notificationService.createNotification({
      userId: escrow.vendorId.toString(),
      title: "Payment Released",
      message: "Payment released - Order completed",
      type: "payment",
      priority: "medium"
    });

    await commitTransaction(session);
    return { success: true, data: updatedEscrow };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error releasing escrow:", error);
    return { success: false, error: "Failed to release escrow" };
  }
}

export async function refundEscrow(refundData: RefundEscrowData, refundedBy: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const escrow = await escrowRepo.getEscrowById(refundData.escrowId);
    if (!escrow) {
      return { success: false, error: "Escrow not found" };
    }

    if (escrow.status !== EscrowStatus.FUNDED && escrow.status !== EscrowStatus.DISPUTED) {
      return { success: false, error: "Escrow cannot be refunded in current status" };
    }

    const refundAmount = refundData.refundAmount || escrow.amount;
    
    if (refundAmount > escrow.amount) {
      return { success: false, error: "Refund amount cannot exceed escrow amount" };
    }

    // Update escrow
    const updatedEscrow = await escrowRepo.updateEscrow(refundData.escrowId, {
      status: EscrowStatus.REFUNDED,
      refundedAmount: refundAmount,
      refundedBy,
      refundReason: refundData.refundReason,
      refundedAt: new Date(),
      updatedAt: new Date()
    }, { session });

    // Update order status
    await orderRepo.updateOrderById(escrow.orderId.toString(), {
      status: 'refunded',
      updatedAt: new Date()
    }, { session });

    // Send notifications
    await notificationService.createNotification({
      userId: escrow.buyerId.toString(),
      title: "Order Refunded",
      message: "Order refunded - Payment returned",
      type: "payment",
      priority: "medium"
    });

    await notificationService.createNotification({
      userId: escrow.vendorId.toString(),
      title: "Order Refunded",
      message: "Order refunded",
      type: "order",
      priority: "medium"
    });

    await commitTransaction(session);
    return { success: true, data: updatedEscrow };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error refunding escrow:", error);
    return { success: false, error: "Failed to refund escrow" };
  }
}

export async function disputeEscrow(escrowId: string, disputedBy: string, disputeReason: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const escrow = await escrowRepo.getEscrowById(escrowId);
    if (!escrow) {
      return { success: false, error: "Escrow not found" };
    }

    if (escrow.status !== EscrowStatus.FUNDED) {
      return { success: false, error: "Can only dispute funded escrows" };
    }

    // Validate dispute authority
    const canDispute = escrow.buyerId.toString() === disputedBy || 
                      escrow.vendorId.toString() === disputedBy;
    if (!canDispute) {
      return { success: false, error: "Unauthorized to dispute escrow" };
    }

    // Update escrow
    const updatedEscrow = await escrowRepo.updateEscrow(escrowId, {
      status: EscrowStatus.DISPUTED,
      disputedBy,
      disputeReason,
      disputedAt: new Date(),
      updatedAt: new Date()
    }, { session });

    // Update order status
    await orderRepo.updateOrderById(escrow.orderId.toString(), {
      status: 'disputed',
      updatedAt: new Date()
    }, { session });

    // Send notifications
    const otherParty = disputedBy === escrow.buyerId.toString() ? 
                      escrow.vendorId.toString() : escrow.buyerId.toString();

    await notificationService.createNotification({
      userId: disputedBy,
      title: "Dispute Initiated",
      message: "Dispute initiated - Under review",
      type: "dispute",
      priority: "high"
    });

    await notificationService.createNotification({
      userId: otherParty,
      title: "Order Disputed",
      message: "Order disputed - Under review",
      type: "dispute",
      priority: "high"
    });

    await commitTransaction(session);
    return { success: true, data: updatedEscrow };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error disputing escrow:", error);
    return { success: false, error: "Failed to dispute escrow" };
  }
}

export async function getEscrowById(escrowId: string) {
  try {
    await connectDB();
    const escrow = await escrowRepo.getEscrowById(escrowId);
    
    if (!escrow) {
      return { success: false, error: "Escrow not found" };
    }

    return { success: true, data: escrow };
  } catch (error) {
    console.error("Error fetching escrow:", error);
    return { success: false, error: "Failed to fetch escrow" };
  }
}

export async function getEscrowByOrder(orderId: string) {
  try {
    await connectDB();
    const escrow = await escrowRepo.getEscrowByOrderId(orderId);
    
    if (!escrow) {
      return { success: false, error: "Escrow not found for this order" };
    }

    return { success: true, data: escrow };
  } catch (error) {
    console.error("Error fetching escrow by order:", error);
    return { success: false, error: "Failed to fetch escrow" };
  }
}

export async function getUserEscrows(userId: string, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const skip = (page - 1) * limit;
    const escrows = await escrowRepo.getEscrowsByBuyerId(userId, { limit, skip, sort: { createdAt: -1 } });
    return { success: true, data: escrows };
  } catch (error) {
    console.error("Error fetching user escrows:", error);
    return { success: false, error: "Failed to fetch escrows" };
  }
}

export async function getVendorEscrows(vendorId: string, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    
    const vendor = await vendorRepo.getVendorById(vendorId);
    if (!vendor) {
      return { success: false, error: "Vendor not found" };
    }

    const skip = (page - 1) * limit;
    const escrows = await escrowRepo.getEscrowsByVendorId(vendorId, { limit, skip, sort: { createdAt: -1 } });
    return { success: true, data: escrows };
  } catch (error) {
    console.error("Error fetching vendor escrows:", error);
    return { success: false, error: "Failed to fetch escrows" };
  }
}

export async function getEscrowStats(userId?: string, vendorId?: string) {
  try {
    await connectDB();
    
    let stats;
    if (userId) {
      stats = await escrowRepo.getEscrowStats({ buyerId: userId });
    } else if (vendorId) {
      stats = await escrowRepo.getEscrowStats({ vendorId: vendorId });
    } else {
      stats = await escrowRepo.getEscrowStats({});
    }

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching escrow stats:", error);
    return { success: false, error: "Failed to fetch escrow statistics" };
  }
}

export async function cancelEscrow(escrowId: string, cancelledBy: string, cancelReason: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const escrow = await escrowRepo.getEscrowById(escrowId);
    if (!escrow) {
      return { success: false, error: "Escrow not found" };
    }

    if (escrow.status !== EscrowStatus.PENDING) {
      return { success: false, error: "Can only cancel pending escrows" };
    }

    // Validate cancel authority
    const canCancel = escrow.buyerId.toString() === cancelledBy || 
                     escrow.vendorId.toString() === cancelledBy;
    if (!canCancel) {
      return { success: false, error: "Unauthorized to cancel escrow" };
    }

    // Update escrow
    const updatedEscrow = await escrowRepo.updateEscrow(escrowId, {
      status: EscrowStatus.CANCELLED,
      cancelledBy,
      cancelReason,
      cancelledAt: new Date(),
      updatedAt: new Date()
    }, { session });

    // Update order status
    await orderRepo.updateOrder(escrow.orderId.toString(), {
      status: 'cancelled',
      updatedAt: new Date()
    }, { session });

    // Send notifications
    await notificationService.createNotification({
      userId: escrow.buyerId.toString(),
      title: "Order Cancelled",
      message: "Order cancelled",
      type: "order",
      priority: "medium"
    });

    await notificationService.createNotification({
      userId: escrow.vendorId.toString(),
      title: "Order Cancelled",
      message: "Order cancelled",
      type: "order",
      priority: "medium"
    });

    await commitTransaction(session);
    return { success: true, data: updatedEscrow };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error cancelling escrow:", error);
    return { success: false, error: "Failed to cancel escrow" };
  }
}

// Auto-release escrow after delivery confirmation and grace period
export async function autoReleaseEscrow(escrowId: string) {
  try {
    const escrow = await escrowRepo.getEscrowById(escrowId);
    if (!escrow) {
      return { success: false, error: "Escrow not found" };
    }

    const order = await orderRepo.getOrderById(escrow.orderId.toString());
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Check if order is delivered and grace period has passed
    if (order.status === 'delivered' && order.deliveredAt) {
      const gracePeriod = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      const now = new Date();
      const deliveredAt = new Date(order.deliveredAt);
      
      if (now.getTime() - deliveredAt.getTime() >= gracePeriod) {
        return await releaseEscrow({
          escrowId,
          releaseReason: 'Auto-release after delivery grace period'
        }, 'system');
      }
    }

    return { success: false, error: "Auto-release conditions not met" };
  } catch (error) {
    console.error("Error auto-releasing escrow:", error);
    return { success: false, error: "Failed to auto-release escrow" };
  }
}