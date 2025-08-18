import { Document, Types } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'buyer' | 'vendor' | 'admin';
  auth_provider: 'local' | 'google' | 'facebook' | 'apple';
  profileImage?: string;
  phone?: string;
  address?: string;
  verified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
  validatePassword(password: string): Promise<boolean>;
}

export interface IVendor extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  farmName: string;
  description?: string;
  location: string;
  coverImage?: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  farmerType: 'individual' | 'cooperative' | 'company';
  businessLicense?: string;
  certifications: string[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  bankDetails: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    routingNumber?: string;
  };
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  vendorId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  categoryId: Types.ObjectId;
  images: string[];
  available: boolean;
  featured: boolean;
  organic: boolean;
  harvestDate?: Date;
  expiryDate?: Date;
  nutritionalInfo?: any;
  tags: string[];
  rating: number;
  totalReviews: number;
  totalSold: number;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  slug: string;
  parentId?: Types.ObjectId;
  image?: string;
  icon?: string;
  active: boolean;
  sortOrder: number;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  productId: Types.ObjectId;
  productName: string;
  vendorId: Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  buyerId: Types.ObjectId;
  items: IOrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  totalAmount: number;
  shippingAddress: any;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  escrowId?: Types.ObjectId;
  shippingCost: number;
  tax: number;
  discount: number;
  notes?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItem extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDispute extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  buyerId: Types.ObjectId;
  vendorId: Types.ObjectId;
  reason: string;
  description: string;
  evidence: string[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  adminId?: Types.ObjectId;
  adminNotes?: string;
  resolution?: string;
  refundAmount?: number;
  resolvedAt?: Date;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFarmerRequest extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  farmName: string;
  description: string;
  location: string;
  farmerType: 'individual' | 'cooperative' | 'company';
  documents: string[];
  businessLicense?: string;
  identificationDocument?: string;
  farmCertificates: string[];
  contactPhone: string;
  yearsOfExperience?: number;
  farmSize?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  adminId?: Types.ObjectId;
  adminNotes?: string;
  rejectionReason?: string;
  reviewedAt?: Date;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  rating: number;
  title?: string;
  content: string;
  images: string[];
  helpful: number;
  unhelpful: number;
  verified: boolean;
  vendorResponse?: {
    content: string;
    respondedAt: Date;
  };
  flagged: boolean;
  flagReason?: string;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'shipping' | 'review' | 'dispute' | 'vendor_approval' | 'product' | 'system' | 'promotion' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  readAt?: Date;
  actionUrl?: string;
  actionText?: string;
  relatedEntityId?: Types.ObjectId;
  relatedEntityType?: 'Order' | 'Product' | 'Dispute' | 'Review' | 'FarmerRequest';
  metadata: any;
  expiresAt?: Date;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'home' | 'work' | 'other';
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  deliveryInstructions?: string;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentMethod extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'card' | 'mobile_money' | 'bank_account';
  provider: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  phoneNumber?: string;
  accountNumber?: string;
  bankName?: string;
  accountHolderName?: string;
  routingNumber?: string;
  nickname?: string;
  isDefault: boolean;
  isVerified: boolean;
  externalId?: string;
  metadata: any;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEscrow extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  buyerId: Types.ObjectId;
  vendorId: Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'funded' | 'released_to_vendor' | 'refunded_to_buyer' | 'disputed' | 'cancelled';
  paymentIntentId?: string;
  releaseConditions: {
    autoReleaseAfterDays: number;
    requiresDeliveryConfirmation: boolean;
    requiresBuyerApproval: boolean;
  };
  fundedAt?: Date;
  releasedAt?: Date;
  refundedAt?: Date;
  autoReleaseDate?: Date;
  releaseReason?: 'buyer_approval' | 'auto_release' | 'admin_release' | 'dispute_resolution';
  refundReason?: string;
  adminNotes?: string;
  transactionFee: number;
  vendorPayout?: {
    amount: number;
    payoutId: string;
    payoutDate: Date;
    payoutStatus: 'pending' | 'completed' | 'failed';
  };
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  type: 'buyer_vendor' | 'buyer_admin' | 'vendor_admin' | 'support';
  title?: string;
  relatedOrderId?: Types.ObjectId;
  relatedDisputeId?: Types.ObjectId;
  lastMessage?: {
    content: string;
    senderId: Types.ObjectId;
    timestamp: Date;
  };
  status: 'active' | 'archived' | 'closed';
  unreadCount: Map<string, number>;
  metadata: any;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments: {
    type: 'image' | 'document' | 'other';
    url: string;
    filename: string;
    size: number;
    mimeType?: string;
  }[];
  readBy: {
    userId: Types.ObjectId;
    readAt: Date;
  }[];
  editedAt?: Date;
  replyTo?: Types.ObjectId;
  systemMessageType?: 'order_created' | 'order_updated' | 'payment_received' | 'dispute_opened' | 'dispute_resolved' | 'user_joined' | 'user_left';
  metadata: any;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  sessionToken: string;
  refreshToken: string;
  deviceInfo: {
    userAgent?: string;
    browser?: string;
    os?: string;
    device?: string;
    ip?: string;
  };
  location: {
    country?: string;
    city?: string;
    region?: string;
  };
  isActive: boolean;
  lastActivity: Date;
  expiresAt: Date;
  refreshTokenExpiresAt: Date;
  revokedAt?: Date;
  revokedReason?: 'logout' | 'security' | 'expired' | 'admin' | 'password_change';
  loginMethod: 'email' | 'google' | 'facebook' | 'apple';
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
  isExpired(): boolean;
  isRefreshTokenExpired(): boolean;
  revoke(reason?: string): Promise<ISession>;
}

export interface IAnalytics extends Document {
  _id: Types.ObjectId;
  type: 'daily_sales' | 'monthly_sales' | 'product_views' | 'user_activity' | 'vendor_performance' | 'order_metrics' | 'revenue_metrics' | 'customer_metrics';
  date: Date;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  newUsers: number;
  activeUsers: number;
  returningUsers: number;
  productViews: number;
  uniqueProductViews: number;
  vendorId?: Types.ObjectId;
  vendorSales: number;
  vendorRevenue: number;
  vendorOrders: number;
  productId?: Types.ObjectId;
  productSales: number;
  productRevenue: number;
  categoryId?: Types.ObjectId;
  categorySales: number;
  categoryRevenue: number;
  conversionRate: number;
  bounceRate: number;
  pageViews: number;
  sessionDuration: number;
  customMetrics: any;
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}