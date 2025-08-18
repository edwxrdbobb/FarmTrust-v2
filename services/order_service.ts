import * as orderRepo from "@/repositories/order_repo";
import * as productRepo from "@/repositories/product_repo";
import * as userRepo from "@/repositories/user_repo";
import * as vendorRepo from "@/repositories/vendor_repo";
import * as escrowRepo from "@/repositories/escrow_repo";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";

export interface CreateOrderData {
  items: {
    product: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  notes?: string;
}

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  PAYMENT_FAILED = 'payment_failed'
}

export async function createOrder(userId: string, orderData: CreateOrderData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate user exists
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate products and calculate totals
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];
    const vendorItems = new Map<string, { items: OrderItem[], amount: number }>();

    for (const item of orderData.items) {
      const product = await productRepo.getProductById(item.product);
      if (!product) {
        return { success: false, error: `Product ${item.product} not found` };
      }

      if (!product.isActive) {
        return { success: false, error: `Product ${product.name} is not available` };
      }

      if (product.stock < item.quantity) {
        return { success: false, error: `Insufficient stock for ${product.name}` };
      }

      const subtotal = item.price * item.quantity;
      totalAmount += subtotal;
      
      const orderItem = {
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        subtotal
      };
      
      orderItems.push(orderItem);

      // Group items by vendor for escrow creation
      const vendorId = product.vendor.toString();
      if (!vendorItems.has(vendorId)) {
        vendorItems.set(vendorId, { items: [], amount: 0 });
      }
      vendorItems.get(vendorId)!.items.push(orderItem);
      vendorItems.get(vendorId)!.amount += subtotal;
    }

    // Create order
    const order = await orderRepo.createOrder({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      status: OrderStatus.PENDING,
      notes: orderData.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Create escrow for each vendor
    for (const [vendorId, vendorData] of vendorItems) {
      await escrowRepo.createEscrowForOrder({
        orderId: order._id,
        buyerId: userId,
        vendorId: vendorId,
        amount: vendorData.amount,
        currency: "SLL",
        status: "pending",
        releaseConditions: {
          autoReleaseAfterDays: 7,
          requiresDeliveryConfirmation: true,
          requiresBuyerApproval: true,
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }, session);
    }

    // Update product stock
    for (const item of orderData.items) {
      await productRepo.updateProductStock(item.product, -item.quantity);
    }

    await commitTransaction(session);
    return { success: true, data: order };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function getOrderById(orderId: string, userId?: string) {
  try {
    await connectDB();
    const order = await orderRepo.getOrderById(orderId);
    
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // If userId is provided, verify ownership
    if (userId && order.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to view this order" };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

export async function getUserOrders(userId: string, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    
    const orders = await orderRepo.getOrdersByBuyerId(userId, {
      sort: { createdAt: -1 },
      limit,
      skip
    });
    
    const totalOrders = await orderRepo.countOrders({ buyerId: userId });
    
    return {
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / limit)
        }
      }
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { success: false, error: "Failed to fetch user orders" };
  }
}

export async function getVendorOrders(vendorId: string, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    
    const orders = await orderRepo.getOrdersByVendorId(vendorId, {
      sort: { createdAt: -1 },
      limit,
      skip
    });
    
    const totalOrders = await orderRepo.countOrdersByVendor(vendorId);
    
    return {
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / limit)
        }
      }
    };
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return { success: false, error: "Failed to fetch vendor orders" };
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, vendorId?: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const order = await orderRepo.getOrderById(orderId);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Validate status transition
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, OrderStatus.PAYMENT_FAILED],
      [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.REFUNDED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.REFUNDED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.DISPUTED]: [OrderStatus.REFUNDED, OrderStatus.DELIVERED],
      [OrderStatus.PAYMENT_FAILED]: [OrderStatus.CANCELLED]
    };

    if (!validTransitions[order.status as OrderStatus]?.includes(status)) {
      return { success: false, error: `Invalid status transition from ${order.status} to ${status}` };
    }

    const updatedOrder = await orderRepo.updateOrderStatus(orderId, status);

    // Handle escrow based on status
    if (status === OrderStatus.DELIVERED) {
      // Mark escrow as delivered and start 3-day confirmation period
      await escrowRepo.markEscrowAsDelivered(orderId);
    } else if (status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED) {
      // Refund escrow to buyer
      await escrowRepo.refundEscrowForOrder(orderId, session);
      
      // Restore product stock
      for (const item of order.items) {
        await productRepo.updateProductStock(item.product.toString(), item.quantity);
      }
    }

    await commitTransaction(session);
    return { success: true, data: updatedOrder };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function cancelOrder(orderId: string, userId: string, reason?: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const order = await orderRepo.getOrderById(orderId);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    if (order.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to cancel this order" };
    }

    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status as OrderStatus)) {
      return { success: false, error: "Order cannot be cancelled at this stage" };
    }

    const updatedOrder = await orderRepo.updateOrder(orderId, {
      status: OrderStatus.CANCELLED,
      cancellationReason: reason,
      cancelledAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Refund escrow to buyer
    await escrowRepo.refundEscrowForOrder(orderId, session);

    // Restore product stock
    for (const item of order.items) {
              await productRepo.updateProductStock(item.product.toString(), item.quantity);
    }

    await commitTransaction(session);
    return { success: true, data: updatedOrder };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error cancelling order:", error);
    return { success: false, error: "Failed to cancel order" };
  }
}

export async function getOrderAnalytics(vendorId?: string, startDate?: Date, endDate?: Date) {
  try {
    await connectDB();
    // Use the available stats function
    const stats = await orderRepo.getOrderStats({ vendorId });
    return { success: true, data: stats };
  } catch (error) {
    console.error("Error fetching order analytics:", error);
    return { success: false, error: "Failed to fetch order analytics" };
  }
}

export async function searchOrders(query: string, filters?: any, page: number = 1, limit: number = 10) {
  try {
    await connectDB();
    const skip = (page - 1) * limit;
    
    // Use the available getOrders function with search filter
    const searchFilter = { ...filters, orderNumber: { $regex: query, $options: 'i' } };
    const orders = await orderRepo.getOrders(searchFilter, {
      sort: { createdAt: -1 },
      limit,
      skip
    });
    
    const totalOrders = await orderRepo.countOrders(searchFilter);
    
    return {
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / limit)
        }
      }
    };
  } catch (error) {
    console.error("Error searching orders:", error);
    return { success: false, error: "Failed to search orders" };
  }
}

export async function updateOrderPaymentStatus(orderId: string, paymentStatus: 'pending' | 'paid' | 'failed') {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const order = await orderRepo.getOrderById(orderId);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Map payment status to order status
    let orderStatus: OrderStatus;
    switch (paymentStatus) {
      case 'paid':
        orderStatus = OrderStatus.PAID;
        break;
      case 'failed':
        orderStatus = OrderStatus.PAYMENT_FAILED;
        break;
      default:
        orderStatus = OrderStatus.PENDING_PAYMENT;
    }

    // Update order status
    const updatedOrder = await orderRepo.updateOrder(orderId, {
      status: orderStatus,
      paymentStatus,
      updatedAt: new Date()
    }, session);

    // If payment is successful, fund the escrow
    if (paymentStatus === 'paid') {
      const escrows = await escrowRepo.getEscrows({ orderId }, {});
      for (const escrow of escrows) {
        await escrowRepo.fundEscrow(escrow._id.toString());
      }
    }

    await commitTransaction(session);
    return { success: true, data: updatedOrder };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating order payment status:", error);
    return { success: false, error: "Failed to update order payment status" };
  }
}

// Escrow-specific functions for admin management
export async function releaseEscrowManually(orderId: string, adminId: string, reason?: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const escrow = await escrowRepo.getEscrowByOrderId(orderId);
    if (!escrow) {
      return { success: false, error: "Escrow not found for this order" };
    }

    if (escrow.status !== "funded") {
      return { success: false, error: "Escrow is not in funded status" };
    }

    const updatedEscrow = await escrowRepo.updateEscrow(escrow._id, {
      status: "released_to_vendor",
      releasedAt: new Date(),
      releaseReason: "admin_release",
      adminNotes: reason || "Manually released by admin",
      updatedAt: new Date()
    }, session);

    // Update order status to delivered
    await orderRepo.updateOrderStatus(orderId, OrderStatus.DELIVERED);

    await commitTransaction(session);
    return { success: true, data: updatedEscrow };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error manually releasing escrow:", error);
    return { success: false, error: "Failed to release escrow" };
  }
}

export async function refundEscrowManually(orderId: string, adminId: string, reason?: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const escrow = await escrowRepo.getEscrowByOrderId(orderId);
    if (!escrow) {
      return { success: false, error: "Escrow not found for this order" };
    }

    if (escrow.status !== "funded" && escrow.status !== "pending_confirmation") {
      return { success: false, error: "Escrow is not in a refundable status" };
    }

    const updatedEscrow = await escrowRepo.updateEscrow(escrow._id, {
      status: "refunded_to_buyer",
      releasedAt: new Date(),
      refundReason: reason || "Manually refunded by admin",
      adminNotes: reason || "Manually refunded by admin",
      updatedAt: new Date()
    }, session);

    // Update order status to refunded
    await orderRepo.updateOrderStatus(orderId, OrderStatus.REFUNDED);

    await commitTransaction(session);
    return { success: true, data: updatedEscrow };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error manually refunding escrow:", error);
    return { success: false, error: "Failed to refund escrow" };
  }
}

// New functions for delivery confirmation workflow
export async function confirmOrderDelivery(orderId: string, buyerId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const escrow = await escrowRepo.getEscrowByOrderId(orderId);
    if (!escrow) {
      return { success: false, error: "Escrow not found for this order" };
    }

    if (escrow.status !== "pending_confirmation") {
      return { success: false, error: "Order is not in confirmation period" };
    }

    if (escrow.buyerId.toString() !== buyerId) {
      return { success: false, error: "Unauthorized to confirm this delivery" };
    }

    const updatedEscrow = await escrowRepo.confirmDelivery(escrow._id.toString());

    await commitTransaction(session);
    return { success: true, data: updatedEscrow };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error confirming delivery:", error);
    return { success: false, error: "Failed to confirm delivery" };
  }
}

export async function processAutoReleaseEscrows() {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Get all escrows that have passed the confirmation deadline
    const escrowsReadyForRelease = await escrowRepo.getEscrowsReadyForAutoRelease();
    
    const results = [];
    for (const escrow of escrowsReadyForRelease) {
      try {
        const updatedEscrow = await escrowRepo.updateEscrow(escrow._id, {
          status: "released_to_vendor",
          releasedAt: new Date(),
          releaseReason: "auto_release",
          adminNotes: "Automatically released after 3-day confirmation period",
          updatedAt: new Date()
        }, session);

        results.push({
          escrowId: escrow._id,
          orderId: escrow.orderId,
          success: true,
          message: "Auto-released successfully"
        });
      } catch (error) {
        results.push({
          escrowId: escrow._id,
          orderId: escrow.orderId,
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    await commitTransaction(session);
    return { success: true, data: results };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error processing auto-release escrows:", error);
    return { success: false, error: "Failed to process auto-release escrows" };
  }
}

export async function getEscrowStatus(orderId: string, userId: string) {
  try {
    await connectDB();
    
    const escrow = await escrowRepo.getEscrowByOrderId(orderId);
    if (!escrow) {
      return { success: false, error: "Escrow not found" };
    }

    // Check if user is authorized to view this escrow
    if (escrow.buyerId.toString() !== userId && escrow.vendorId.toString() !== userId) {
      return { success: false, error: "Unauthorized to view this escrow" };
    }

    return {
      success: true,
      data: {
        status: escrow.status,
        amount: escrow.amount,
        currency: escrow.currency,
        deliveredAt: escrow.deliveredAt,
        confirmationDeadline: escrow.confirmationDeadline,
        buyerConfirmedAt: escrow.buyerConfirmedAt,
        releasedAt: escrow.releasedAt,
        refundedAt: escrow.refundedAt,
        releaseReason: escrow.releaseReason,
        refundReason: escrow.refundReason
      }
    };
  } catch (error) {
    console.error("Error getting escrow status:", error);
    return { success: false, error: "Failed to get escrow status" };
  }
}