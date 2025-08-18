import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  productName: {
    type: String,
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Vendor",
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: [
        "pending",
        "pending_payment",
        "paid",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
        "disputed",
        "payment_failed"
      ],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["card", "mobile_money", "bank_transfer", "cash_on_delivery"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "paid", "refunded", "failed", "cancelled"],
      default: "pending",
    },
    // Monime payment integration fields
    payment: {
      provider: {
        type: String,
        enum: ["monime", "manual"],
        default: "manual"
      },
      method: {
        type: String,
        enum: ["orange_money", "afrimoney", "africell_money", "bank_transfer", "cash_on_delivery"],
        default: null
      },
      reference: {
        type: String,
        default: null,
        index: true
      },
      paymentId: {
        type: String,
        default: null
      },
      transactionId: {
        type: String,
        default: null
      },
      status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed", "cancelled"],
        default: "pending"
      },
      amount: {
        type: Number,
        default: null
      },
      currency: {
        type: String,
        default: "SLE"
      },
      initiatedAt: {
        type: Date,
        default: null
      },
      completedAt: {
        type: Date,
        default: null
      },
      updatedAt: {
        type: Date,
        default: null
      }
    },
    escrowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Escrow",
      default: null,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: null,
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },
    actualDelivery: {
      type: Date,
      default: null,
    },
    trackingNumber: {
      type: String,
      default: null,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
orderSchema.index({ buyerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "items.vendorId": 1 });

// Pre-save middleware to generate order number
orderSchema.pre("save", function (next: any) {
  if (!this.orderNumber) {
    this.orderNumber = `FT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);