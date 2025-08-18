// Monime Payment Service for FarmTrust
// Integrates with Monime's payment orchestration platform for Sierra Leone
// Supports Orange Money and Afrimoney mobile money payments
// Updated to use latest Monime SDK and API patterns

interface MonimePaymentRequest {
  amount: number;
  currency: string;
  reference: string;
  description: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  channel: 'mobile_money' | 'card' | 'bank_transfer';
  provider?: 'orange_money' | 'afrimoney' | 'africell_money';
  phone?: string; // Required for mobile money
  metadata?: Record<string, any>;
  callback_url?: string;
  return_url?: string;
  space_id?: string; // Monime space ID
}

interface MonimePaymentResponse {
  success: boolean;
  data?: {
    payment_id: string;
    reference: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
    payment_url?: string;
    checkout_url?: string;
    expires_at?: string;
    transaction_id?: string;
  };
  error?: string;
  message?: string;
}

interface MonimePaymentStatus {
  payment_id: string;
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

interface MonimeConfig {
  apiKey: string;
  secretKey: string;
  spaceId: string;
  baseUrl: string;
  environment: 'sandbox' | 'live';
}

class MonimeService {
  private config: MonimeConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.MONIME_BASE_URL || 'https://api.monime.io',
      apiKey: process.env.MONIME_API_KEY || '',
      secretKey: process.env.MONIME_SECRET_KEY || '',
      spaceId: process.env.MONIME_SPACE_ID || '',
      environment: (process.env.MONIME_ENVIRONMENT as 'sandbox' | 'live') || 'sandbox'
    };
    
    if (!this.config.apiKey || !this.config.secretKey || !this.config.spaceId) {
      console.warn('Monime API credentials not fully configured. Please set MONIME_API_KEY, MONIME_SECRET_KEY, and MONIME_SPACE_ID');
    }
  }

  /**
   * Initialize a payment with Monime using the latest API
   */
  async initializePayment(paymentData: MonimePaymentRequest): Promise<MonimePaymentResponse> {
    try {
      const payload = {
        ...paymentData,
        currency: paymentData.currency || 'SLE', // Sierra Leone Leone
        space_id: this.config.spaceId,
        metadata: {
          ...paymentData.metadata,
          source: 'farmtrust',
          environment: this.config.environment
        }
      };

      const response = await fetch(`${this.config.baseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-API-Key': this.config.apiKey,
          'X-Space-ID': this.config.spaceId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Monime API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        return {
          success: false,
          error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      console.log('Monime payment initialized successfully:', data);
      
      return {
        success: true,
        data: {
          payment_id: data.id || data.payment_id,
          reference: data.reference,
          status: data.status || 'pending',
          amount: data.amount,
          currency: data.currency,
          payment_url: data.payment_url || data.checkout_url,
          checkout_url: data.checkout_url || data.payment_url,
          expires_at: data.expires_at,
          transaction_id: data.transaction_id,
        },
      };
    } catch (error) {
      console.error('Monime payment initialization failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initialization failed',
      };
    }
  }

  /**
   * Verify payment status with Monime
   */
  async verifyPayment(reference: string): Promise<MonimePaymentResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/payments/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-API-Key': this.config.apiKey,
          'X-Space-ID': this.config.spaceId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          payment_id: data.id || data.payment_id,
          reference: data.reference,
          status: data.status,
          amount: data.amount,
          currency: data.currency,
          transaction_id: data.transaction_id,
        },
      };
    } catch (error) {
      console.error('Monime payment verification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment verification failed',
      };
    }
  }

  /**
   * Get payment status by payment ID
   */
  async getPaymentStatus(paymentId: string): Promise<{ success: boolean; data?: MonimePaymentStatus; error?: string }> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-API-Key': this.config.apiKey,
          'X-Space-ID': this.config.spaceId,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Monime get payment status failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payment status',
      };
    }
  }

  /**
   * Create a mobile money payment specifically for Orange Money or Afrimoney
   */
  async createMobileMoneyPayment(data: {
    amount: number;
    phone: string;
    provider: 'orange_money' | 'afrimoney';
    reference: string;
    description: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
  }): Promise<MonimePaymentResponse> {
    const paymentRequest: MonimePaymentRequest = {
      amount: data.amount,
      currency: 'SLE',
      reference: data.reference,
      description: data.description,
      customer: data.customer,
      channel: 'mobile_money',
      provider: data.provider,
      phone: data.phone,
      metadata: {
        phone: data.phone,
        provider: data.provider,
        order_type: 'farmtrust_order',
        source: 'farmtrust_web',
      },
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/monime/webhook`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/success`,
      space_id: this.config.spaceId,
    };

    return this.initializePayment(paymentRequest);
  }

  /**
   * Validate webhook signature for security
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(payload)
        .digest('hex');
      
      return `sha256=${expectedSignature}` === signature;
    } catch (error) {
      console.error('Webhook signature validation failed:', error);
      return false;
    }
  }

  /**
   * Generate a unique payment reference
   */
  generatePaymentReference(orderId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `FT_${orderId.slice(-8)}_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Format amount to match Monime requirements (typically in minor units)
   */
  formatAmount(amount: number): number {
    // Convert to minor units (kobo/cents) - multiply by 100
    // Check Monime docs for actual requirements
    return Math.round(amount * 100);
  }

  /**
   * Check if Monime is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.secretKey && this.config.spaceId);
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus(): { configured: boolean; missing: string[] } {
    const missing = [];
    if (!this.config.apiKey) missing.push('MONIME_API_KEY');
    if (!this.config.secretKey) missing.push('MONIME_SECRET_KEY');
    if (!this.config.spaceId) missing.push('MONIME_SPACE_ID');
    
    return {
      configured: missing.length === 0,
      missing
    };
  }

  /**
   * Get available payment methods for Sierra Leone
   */
  getAvailablePaymentMethods(): Array<{
    id: string;
    name: string;
    type: 'mobile_money' | 'card' | 'bank_transfer';
    provider?: string;
    description: string;
    icon?: string;
  }> {
    return [
      {
        id: 'orange_money',
        name: 'Orange Money',
        type: 'mobile_money',
        provider: 'orange_money',
        description: 'Pay with Orange Money mobile money',
        icon: '🟠'
      },
      {
        id: 'afrimoney',
        name: 'Afrimoney',
        type: 'mobile_money',
        provider: 'afrimoney',
        description: 'Pay with Afrimoney mobile money',
        icon: '🔴'
      },
      {
        id: 'africell_money',
        name: 'Africell Money',
        type: 'mobile_money',
        provider: 'africell_money',
        description: 'Pay with Africell Money mobile money',
        icon: '🔵'
      }
    ];
  }
}

export const monimeService = new MonimeService();
export type { MonimePaymentRequest, MonimePaymentResponse, MonimePaymentStatus, MonimeConfig };
