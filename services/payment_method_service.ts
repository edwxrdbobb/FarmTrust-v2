import * as paymentMethodRepo from "@/repositories/payment_method_repo";
import * as userRepo from "@/repositories/user_repo";
import * as notificationService from "./notification_service";
import { connectDB } from "@/lib/db";
import { startTransaction, commitTransaction, abortTransaction } from "@/lib/db_transaction";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

export interface CreatePaymentMethodData {
  type: PaymentMethodType;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  cardholderName?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountHolderName?: string;
  walletAddress?: string;
  walletType?: string;
  isDefault?: boolean;
}

export interface UpdatePaymentMethodData {
  cardholderName?: string;
  expiryMonth?: number;
  expiryYear?: number;
  bankName?: string;
  accountHolderName?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface ProcessPaymentData {
  paymentMethodId: string;
  amount: number;
  currency: string;
  description?: string;
  orderId?: string;
  metadata?: any;
}

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_ACCOUNT = 'bank_account',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTO_WALLET = 'crypto_wallet',
  MOBILE_MONEY = 'mobile_money'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export async function createPaymentMethod(userId: string, paymentData: CreatePaymentMethodData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate user
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate payment method data
    const validationResult = validatePaymentMethodData(paymentData);
    if (!validationResult.isValid) {
      return { success: false, error: validationResult.error };
    }

    // Check if this is the first payment method (make it default)
    const existingMethods = await paymentMethodRepo.getPaymentMethodsByUser(userId);
    const isFirstMethod = existingMethods.length === 0;

    // If setting as default, unset other default methods
    if (paymentData.isDefault || isFirstMethod) {
      await paymentMethodRepo.unsetDefaultPaymentMethods(userId, session);
    }

    // Encrypt sensitive data
    const encryptedData = await encryptSensitiveData(paymentData);

    // Create payment method
    const paymentMethod = await paymentMethodRepo.createPaymentMethod({
      user: userId,
      type: paymentData.type,
      ...encryptedData,
      isDefault: paymentData.isDefault || isFirstMethod,
      isActive: true,
      isVerified: false,
      lastUsed: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Send verification notification
    await notificationService.createNotification({
      user: userId,
      title: 'Payment Method Added',
      message: `Your ${paymentData.type.replace('_', ' ')} has been added successfully`,
      type: 'payment',
      relatedId: paymentMethod._id.toString(),
      relatedModel: 'PaymentMethod'
    });

    await commitTransaction(session);
    
    // Return payment method without sensitive data
    const sanitizedPaymentMethod = sanitizePaymentMethod(paymentMethod);
    return { success: true, data: sanitizedPaymentMethod };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error creating payment method:", error);
    return { success: false, error: "Failed to create payment method" };
  }
}

export async function getPaymentMethodById(paymentMethodId: string, userId: string) {
  try {
    await connectDB();
    
    const paymentMethod = await paymentMethodRepo.getPaymentMethodById(paymentMethodId);
    if (!paymentMethod) {
      return { success: false, error: "Payment method not found" };
    }

    // Check ownership
    if (paymentMethod.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to access this payment method" };
    }

    const sanitizedPaymentMethod = sanitizePaymentMethod(paymentMethod);
    return { success: true, data: sanitizedPaymentMethod };
  } catch (error) {
    console.error("Error fetching payment method:", error);
    return { success: false, error: "Failed to fetch payment method" };
  }
}

export async function getUserPaymentMethods(userId: string, includeInactive: boolean = false) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const paymentMethods = await paymentMethodRepo.getPaymentMethodsByUser(userId, includeInactive);
    
    // Sanitize sensitive data
    const sanitizedMethods = paymentMethods.map(method => sanitizePaymentMethod(method));
    
    return { success: true, data: sanitizedMethods };
  } catch (error) {
    console.error("Error fetching user payment methods:", error);
    return { success: false, error: "Failed to fetch payment methods" };
  }
}

export async function updatePaymentMethod(paymentMethodId: string, userId: string, updateData: UpdatePaymentMethodData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const paymentMethod = await paymentMethodRepo.getPaymentMethodById(paymentMethodId);
    if (!paymentMethod) {
      return { success: false, error: "Payment method not found" };
    }

    // Check ownership
    if (paymentMethod.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to update this payment method" };
    }

    // If setting as default, unset other default methods
    if (updateData.isDefault) {
      await paymentMethodRepo.unsetDefaultPaymentMethods(userId, session);
    }

    // Update payment method
    const updatedPaymentMethod = await paymentMethodRepo.updatePaymentMethod(paymentMethodId, {
      ...updateData,
      updatedAt: new Date()
    }, session);

    await commitTransaction(session);
    
    const sanitizedPaymentMethod = sanitizePaymentMethod(updatedPaymentMethod);
    return { success: true, data: sanitizedPaymentMethod };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error updating payment method:", error);
    return { success: false, error: "Failed to update payment method" };
  }
}

export async function deletePaymentMethod(paymentMethodId: string, userId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const paymentMethod = await paymentMethodRepo.getPaymentMethodById(paymentMethodId);
    if (!paymentMethod) {
      return { success: false, error: "Payment method not found" };
    }

    // Check ownership
    if (paymentMethod.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to delete this payment method" };
    }

    // Check if it's the default method
    if (paymentMethod.isDefault) {
      const otherMethods = await paymentMethodRepo.getPaymentMethodsByUser(userId);
      const activeMethods = otherMethods.filter(m => 
        m._id.toString() !== paymentMethodId && m.isActive
      );
      
      if (activeMethods.length > 0) {
        // Set another method as default
        await paymentMethodRepo.updatePaymentMethod(activeMethods[0]._id.toString(), {
          isDefault: true,
          updatedAt: new Date()
        }, session);
      }
    }

    // Soft delete the payment method
    await paymentMethodRepo.updatePaymentMethod(paymentMethodId, {
      isActive: false,
      isDefault: false,
      deletedAt: new Date(),
      updatedAt: new Date()
    }, session);

    await commitTransaction(session);
    return { success: true, message: "Payment method deleted successfully" };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error deleting payment method:", error);
    return { success: false, error: "Failed to delete payment method" };
  }
}

export async function setDefaultPaymentMethod(paymentMethodId: string, userId: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const paymentMethod = await paymentMethodRepo.getPaymentMethodById(paymentMethodId);
    if (!paymentMethod) {
      return { success: false, error: "Payment method not found" };
    }

    // Check ownership
    if (paymentMethod.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to modify this payment method" };
    }

    // Check if method is active
    if (!paymentMethod.isActive) {
      return { success: false, error: "Cannot set inactive payment method as default" };
    }

    // Unset other default methods
    await paymentMethodRepo.unsetDefaultPaymentMethods(userId, session);

    // Set this method as default
    const updatedPaymentMethod = await paymentMethodRepo.updatePaymentMethod(paymentMethodId, {
      isDefault: true,
      updatedAt: new Date()
    }, session);

    await commitTransaction(session);
    
    const sanitizedPaymentMethod = sanitizePaymentMethod(updatedPaymentMethod);
    return { success: true, data: sanitizedPaymentMethod };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error setting default payment method:", error);
    return { success: false, error: "Failed to set default payment method" };
  }
}

export async function verifyPaymentMethod(paymentMethodId: string, userId: string, verificationData: any) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const paymentMethod = await paymentMethodRepo.getPaymentMethodById(paymentMethodId);
    if (!paymentMethod) {
      return { success: false, error: "Payment method not found" };
    }

    // Check ownership
    if (paymentMethod.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to verify this payment method" };
    }

    // Perform verification based on payment method type
    const verificationResult = await performVerification(paymentMethod, verificationData);
    if (!verificationResult.success) {
      return verificationResult;
    }

    // Update payment method as verified
    const updatedPaymentMethod = await paymentMethodRepo.updatePaymentMethod(paymentMethodId, {
      isVerified: true,
      verifiedAt: new Date(),
      verificationData: verificationResult.data,
      updatedAt: new Date()
    }, session);

    // Send notification
    await notificationService.createNotification({
      user: userId,
      title: 'Payment Method Verified',
      message: `Your ${paymentMethod.type.replace('_', ' ')} has been verified successfully`,
      type: 'payment',
      relatedId: paymentMethodId,
      relatedModel: 'PaymentMethod'
    });

    await commitTransaction(session);
    
    const sanitizedPaymentMethod = sanitizePaymentMethod(updatedPaymentMethod);
    return { success: true, data: sanitizedPaymentMethod };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error verifying payment method:", error);
    return { success: false, error: "Failed to verify payment method" };
  }
}

export async function processPayment(userId: string, paymentData: ProcessPaymentData) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    // Validate user
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate payment method
    const paymentMethod = await paymentMethodRepo.getPaymentMethodById(paymentData.paymentMethodId);
    if (!paymentMethod) {
      return { success: false, error: "Payment method not found" };
    }

    // Check ownership
    if (paymentMethod.user.toString() !== userId) {
      return { success: false, error: "Unauthorized to use this payment method" };
    }

    // Check if payment method is active and verified
    if (!paymentMethod.isActive) {
      return { success: false, error: "Payment method is inactive" };
    }

    if (!paymentMethod.isVerified) {
      return { success: false, error: "Payment method is not verified" };
    }

    // Validate amount
    if (paymentData.amount <= 0) {
      return { success: false, error: "Invalid payment amount" };
    }

    // Create payment transaction
    const transaction = await paymentMethodRepo.createPaymentTransaction({
      user: userId,
      paymentMethod: paymentData.paymentMethodId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
      orderId: paymentData.orderId,
      metadata: paymentData.metadata,
      status: PaymentStatus.PENDING,
      transactionId: generateTransactionId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, session);

    // Process payment with external payment gateway
    const paymentResult = await processExternalPayment(paymentMethod, paymentData);
    
    if (paymentResult.success) {
      // Update transaction status
      await paymentMethodRepo.updatePaymentTransaction(transaction._id.toString(), {
        status: PaymentStatus.COMPLETED,
        externalTransactionId: paymentResult.transactionId,
        processedAt: new Date(),
        updatedAt: new Date()
      }, session);

      // Update payment method last used
      await paymentMethodRepo.updatePaymentMethod(paymentData.paymentMethodId, {
        lastUsed: new Date(),
        updatedAt: new Date()
      }, session);

      // Send success notification
      await notificationService.createNotification({
        user: userId,
        title: 'Payment Successful',
        message: `Payment of ${paymentData.currency} ${paymentData.amount} was processed successfully`,
        type: 'payment',
        relatedId: transaction._id.toString(),
        relatedModel: 'PaymentTransaction'
      });
    } else {
      // Update transaction status as failed
      await paymentMethodRepo.updatePaymentTransaction(transaction._id.toString(), {
        status: PaymentStatus.FAILED,
        failureReason: paymentResult.error,
        updatedAt: new Date()
      }, session);

      // Send failure notification
      await notificationService.createNotification({
        user: userId,
        title: 'Payment Failed',
        message: `Payment of ${paymentData.currency} ${paymentData.amount} failed: ${paymentResult.error}`,
        type: 'payment',
        relatedId: transaction._id.toString(),
        relatedModel: 'PaymentTransaction'
      });
    }

    await commitTransaction(session);
    return {
      success: paymentResult.success,
      data: {
        transactionId: transaction._id.toString(),
        status: paymentResult.success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        externalTransactionId: paymentResult.transactionId,
        error: paymentResult.error
      }
    };
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error processing payment:", error);
    return { success: false, error: "Failed to process payment" };
  }
}

export async function getPaymentTransactions(userId: string, page: number = 1, limit: number = 20) {
  try {
    await connectDB();
    
    const user = await userRepo.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const transactions = await paymentMethodRepo.getPaymentTransactionsByUser(userId, page, limit);
    return { success: true, data: transactions };
  } catch (error) {
    console.error("Error fetching payment transactions:", error);
    return { success: false, error: "Failed to fetch payment transactions" };
  }
}

export async function refundPayment(transactionId: string, userId: string, reason?: string) {
  let session;
  try {
    await connectDB();
    session = await startTransaction();

    const transaction = await paymentMethodRepo.getPaymentTransactionById(transactionId);
    if (!transaction) {
      return { success: false, error: "Transaction not found" };
    }

    // Check ownership or admin access
    const user = await userRepo.getUserById(userId);
    const isOwner = transaction.user.toString() === userId;
    const isAdmin = user?.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return { success: false, error: "Unauthorized to refund this transaction" };
    }

    // Check if transaction can be refunded
    if (transaction.status !== PaymentStatus.COMPLETED) {
      return { success: false, error: "Only completed transactions can be refunded" };
    }

    // Process refund with external payment gateway
    const refundResult = await processExternalRefund(transaction);
    
    if (refundResult.success) {
      // Update transaction status
      await paymentMethodRepo.updatePaymentTransaction(transactionId, {
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date(),
        refundReason: reason,
        externalRefundId: refundResult.refundId,
        updatedAt: new Date()
      }, session);

      // Send refund notification
      await notificationService.createNotification({
        user: transaction.user.toString(),
        title: 'Payment Refunded',
        message: `Your payment of ${transaction.currency} ${transaction.amount} has been refunded`,
        type: 'payment',
        relatedId: transactionId,
        relatedModel: 'PaymentTransaction'
      });
    }

    await commitTransaction(session);
    return refundResult;
  } catch (error) {
    if (session) await abortTransaction(session);
    console.error("Error processing refund:", error);
    return { success: false, error: "Failed to process refund" };
  }
}

// Helper functions
function validatePaymentMethodData(data: CreatePaymentMethodData): { isValid: boolean; error?: string } {
  switch (data.type) {
    case PaymentMethodType.CREDIT_CARD:
    case PaymentMethodType.DEBIT_CARD:
      if (!data.cardNumber || !data.expiryMonth || !data.expiryYear || !data.cvv || !data.cardholderName) {
        return { isValid: false, error: "Missing required card information" };
      }
      if (data.cardNumber.length < 13 || data.cardNumber.length > 19) {
        return { isValid: false, error: "Invalid card number length" };
      }
      if (data.expiryMonth < 1 || data.expiryMonth > 12) {
        return { isValid: false, error: "Invalid expiry month" };
      }
      if (data.expiryYear < new Date().getFullYear()) {
        return { isValid: false, error: "Card has expired" };
      }
      break;
    
    case PaymentMethodType.BANK_ACCOUNT:
      if (!data.accountNumber || !data.routingNumber || !data.accountHolderName || !data.bankName) {
        return { isValid: false, error: "Missing required bank account information" };
      }
      break;
    
    case PaymentMethodType.CRYPTO_WALLET:
      if (!data.walletAddress || !data.walletType) {
        return { isValid: false, error: "Missing required wallet information" };
      }
      break;
  }
  
  return { isValid: true };
}

async function encryptSensitiveData(data: CreatePaymentMethodData): Promise<any> {
  const encryptedData: any = { ...data };
  
  // Encrypt sensitive fields
  if (data.cardNumber) {
    encryptedData.cardNumber = await bcrypt.hash(data.cardNumber, 10);
    encryptedData.lastFourDigits = data.cardNumber.slice(-4);
  }
  
  if (data.cvv) {
    encryptedData.cvv = await bcrypt.hash(data.cvv, 10);
    delete encryptedData.cvv; // Don't store CVV
  }
  
  if (data.accountNumber) {
    encryptedData.accountNumber = await bcrypt.hash(data.accountNumber, 10);
    encryptedData.lastFourDigits = data.accountNumber.slice(-4);
  }
  
  return encryptedData;
}

function sanitizePaymentMethod(paymentMethod: any): any {
  const sanitized = { ...paymentMethod.toObject() };
  
  // Remove sensitive data
  delete sanitized.cardNumber;
  delete sanitized.cvv;
  delete sanitized.accountNumber;
  delete sanitized.routingNumber;
  delete sanitized.walletAddress;
  
  return sanitized;
}

async function performVerification(paymentMethod: any, verificationData: any): Promise<{ success: boolean; data?: any; error?: string }> {
  // Mock verification - implement actual verification logic
  switch (paymentMethod.type) {
    case PaymentMethodType.CREDIT_CARD:
    case PaymentMethodType.DEBIT_CARD:
      // Verify with card issuer
      return { success: true, data: { verificationCode: 'VERIFIED' } };
    
    case PaymentMethodType.BANK_ACCOUNT:
      // Verify with micro-deposits
      return { success: true, data: { verificationMethod: 'micro_deposits' } };
    
    default:
      return { success: true, data: { verificationMethod: 'manual' } };
  }
}

async function processExternalPayment(paymentMethod: any, paymentData: ProcessPaymentData): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  // Mock payment processing - implement actual payment gateway integration
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      return {
        success: true,
        transactionId: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Payment declined by issuer'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Payment gateway error'
    };
  }
}

async function processExternalRefund(transaction: any): Promise<{ success: boolean; refundId?: string; error?: string }> {
  // Mock refund processing - implement actual payment gateway integration
  try {
    // Simulate refund processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    return {
      success: false,
      error: 'Refund processing failed'
    };
  }
}

function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}