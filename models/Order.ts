import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  total: number;
}

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
}

export interface IOrder extends Document {
  userId: string;
  items: IOrderItem[];
  total: number;
  deliveryFee: number;
  shippingAddress: IShippingAddress;
  paymentMethod: 'orange_money' | 'afrimoney' | 'cash_on_delivery';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  }
});

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  items: [OrderItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingAddress: {
    type: ShippingAddressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['orange_money', 'afrimoney', 'cash_on_delivery'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  trackingNumber: {
    type: String,
    sparse: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
