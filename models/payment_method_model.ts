import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["card", "mobile_money", "bank_account"],
      required: true,
    },
    provider: {
      type: String,
      required: true, // e.g., "visa", "mastercard", "orange_money", "airtel_money"
    },
    // For cards
    last4: {
      type: String,
      default: null,
    },
    expiryMonth: {
      type: Number,
      min: 1,
      max: 12,
      default: null,
    },
    expiryYear: {
      type: Number,
      default: null,
    },
    cardholderName: {
      type: String,
      default: null,
    },
    // For mobile money
    phoneNumber: {
      type: String,
      default: null,
    },
    // For bank accounts
    accountNumber: {
      type: String,
      default: null,
    },
    bankName: {
      type: String,
      default: null,
    },
    accountHolderName: {
      type: String,
      default: null,
    },
    routingNumber: {
      type: String,
      default: null,
    },
    // Common fields
    nickname: {
      type: String,
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // External payment processor data
    externalId: {
      type: String,
      default: null, // ID from payment processor (Stripe, Paystack, etc.)
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
paymentMethodSchema.index({ userId: 1 });
paymentMethodSchema.index({ isDefault: 1 });
paymentMethodSchema.index({ type: 1 });
paymentMethodSchema.index({ externalId: 1 });

// Ensure only one default payment method per user
paymentMethodSchema.pre("save", async function (next: any) {
  if (this.isDefault) {
    await mongoose.model("PaymentMethod").updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export default mongoose.models.PaymentMethod || mongoose.model("PaymentMethod", paymentMethodSchema);