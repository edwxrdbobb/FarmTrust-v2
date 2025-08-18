import { connectDB } from "@/lib/db";
import * as escrowRepo from "@/repositories/escrow_repo";
import * as orderRepo from "@/repositories/order_repo";

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  payment_method: string;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'mobile_money' | 'bank_transfer' | 'card';
  provider: 'africell' | 'orange' | 'qcell' | 'sierra_leone_bank' | 'ecobank' | 'zenith_bank';
  account_number?: string;
  phone_number?: string;
  card_last4?: string;
}

/**
 * Process payment for an order and fund escrow
 */
export async function processPayment(
  orderId: string,
  paymentMethod: PaymentMethod,
  amount: number,
  currency: string = 'SLL'
): Promise<{ success: boolean; paymentIntent?: PaymentIntent; error?: string }> {
  try {
    await connectDB();

    // Validate order exists
    const order = await orderRepo.getOrderById(orderId);
    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Validate amount matches order total
    if (order.totalAmount !== amount) {
      return { success: false, error: "Payment amount does not match order total" };
    }

    // Create payment intent
    const paymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: 'pending',
      payment_method: paymentMethod.type,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Simulate payment processing (in real implementation, this would integrate with payment gateways)
    const paymentSuccess = await simulatePaymentProcessing(paymentIntent, paymentMethod);
    
    if (paymentSuccess) {
      paymentIntent.status = 'succeeded';
      paymentIntent.updated_at = new Date();

      // Fund escrow for this order
      const escrows = await escrowRepo.getEscrows({ orderId }, {});
      for (const escrow of escrows) {
        await escrowRepo.updateEscrow(escrow._id, {
          status: 'funded',
          paymentIntentId: paymentIntent.id,
          fundedAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Update order payment status
      await orderRepo.updateOrder(orderId, {
        paymentStatus: 'paid',
        status: 'paid',
        updatedAt: new Date()
      });

      return { success: true, paymentIntent };
    } else {
      paymentIntent.status = 'failed';
      paymentIntent.updated_at = new Date();

      // Update order payment status
      await orderRepo.updateOrder(orderId, {
        paymentStatus: 'failed',
        status: 'payment_failed',
        updatedAt: new Date()
      });

      return { success: false, error: "Payment processing failed" };
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    return { success: false, error: "Payment processing error" };
  }
}

/**
 * Simulate payment processing (replace with actual payment gateway integration)
 */
async function simulatePaymentProcessing(
  paymentIntent: PaymentIntent,
  paymentMethod: PaymentMethod
): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate payment success/failure based on payment method
  const successRates = {
    'mobile_money': 0.95, // 95% success rate
    'bank_transfer': 0.98, // 98% success rate
    'card': 0.92, // 92% success rate
  };

  const successRate = successRates[paymentMethod.type] || 0.9;
  const random = Math.random();
  
  return random < successRate;
}

/**
 * Get payment methods available in Sierra Leone
 */
export function getAvailablePaymentMethods(): PaymentMethod[] {
  return [
    // Mobile Money
    {
      id: 'africell_momo',
      type: 'mobile_money',
      provider: 'africell',
      phone_number: '+232'
    },
    {
      id: 'orange_money',
      type: 'mobile_money',
      provider: 'orange',
      phone_number: '+232'
    },
    {
      id: 'qcell_money',
      type: 'mobile_money',
      provider: 'qcell',
      phone_number: '+232'
    },
    // Bank Transfers
    {
      id: 'sierra_leone_bank',
      type: 'bank_transfer',
      provider: 'sierra_leone_bank',
      account_number: 'SL'
    },
    {
      id: 'ecobank',
      type: 'bank_transfer',
      provider: 'ecobank',
      account_number: 'SL'
    },
    {
      id: 'zenith_bank',
      type: 'bank_transfer',
      provider: 'zenith_bank',
      account_number: 'SL'
    }
  ];
}

/**
 * Validate payment method
 */
export function validatePaymentMethod(paymentMethod: PaymentMethod): { valid: boolean; error?: string } {
  if (!paymentMethod.type || !paymentMethod.provider) {
    return { valid: false, error: "Invalid payment method" };
  }

  switch (paymentMethod.type) {
    case 'mobile_money':
      if (!paymentMethod.phone_number || !paymentMethod.phone_number.startsWith('+232')) {
        return { valid: false, error: "Invalid Sierra Leone phone number" };
      }
      break;
    case 'bank_transfer':
      if (!paymentMethod.account_number) {
        return { valid: false, error: "Account number required for bank transfer" };
      }
      break;
    case 'card':
      if (!paymentMethod.card_last4) {
        return { valid: false, error: "Card information required" };
      }
      break;
    default:
      return { valid: false, error: "Unsupported payment method" };
  }

  return { valid: true };
}

/**
 * Get payment status
 */
export async function getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent | null> {
  try {
    // In a real implementation, this would query the payment gateway
    // For now, we'll simulate by checking escrow status
    const escrow = await escrowRepo.getEscrows({ paymentIntentId }, {});
    if (escrow.length > 0) {
      const escrowItem = escrow[0];
      return {
        id: paymentIntentId,
        amount: escrowItem.amount,
        currency: escrowItem.currency,
        status: escrowItem.status === 'funded' ? 'succeeded' : 
                escrowItem.status === 'pending' ? 'pending' : 'failed',
        payment_method: 'mobile_money', // Default
        created_at: escrowItem.createdAt,
        updated_at: escrowItem.updatedAt
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting payment status:", error);
    return null;
  }
}

/**
 * Refund payment
 */
// Export a default payment processor object for backward compatibility
export const paymentProcessor = {
  processPayment,
  getAvailablePaymentMethods,
  validatePaymentMethod,
  getPaymentStatus,
  refundPayment
};

export async function refundPayment(
  paymentIntentId: string,
  amount?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    const escrows = await escrowRepo.getEscrows({ paymentIntentId }, {});
    if (escrows.length === 0) {
      return { success: false, error: "Payment not found" };
    }

    // Update escrow status to refunded
    for (const escrow of escrows) {
      await escrowRepo.updateEscrow(escrow._id, {
        status: 'refunded_to_buyer',
        refundedAt: new Date(),
        updatedAt: new Date()
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error refunding payment:", error);
    return { success: false, error: "Refund processing error" };
  }
} 