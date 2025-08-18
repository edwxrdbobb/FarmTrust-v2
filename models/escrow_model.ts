import mongoose from "mongoose";

const escrowSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
      unique: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Vendor",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "SLL", // Sierra Leone Leone
    },
    status: {
      type: String,
      enum: [
        "pending",
        "funded",
        "pending_confirmation", // New status for 3-day confirmation period
        "released_to_vendor",
        "refunded_to_buyer",
        "disputed",
        "cancelled"
      ],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
      default: null, // External payment processor ID
    },
    releaseConditions: {
      autoReleaseAfterDays: { type: Number, default: 3 }, // Changed from 7 to 3 days
      requiresDeliveryConfirmation: { type: Boolean, default: true },
      requiresBuyerApproval: { type: Boolean, default: true },
    },
    fundedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null, // When order is marked as delivered
    },
    confirmationDeadline: {
      type: Date,
      default: null, // 3 days after delivery
    },
    buyerConfirmedAt: {
      type: Date,
      default: null, // When buyer confirms delivery
    },
    releasedAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },
    autoReleaseDate: {
      type: Date,
      default: null,
    },
    releaseReason: {
      type: String,
      enum: [
        "buyer_approval",
        "auto_release",
        "admin_release",
        "dispute_resolution"
      ],
      default: null,
    },
    refundReason: {
      type: String,
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
    },
    transactionFee: {
      type: Number,
      default: 0,
    },
    vendorPayout: {
      amount: { type: Number, default: null },
      payoutId: { type: String, default: null },
      payoutDate: { type: Date, default: null },
      payoutStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: null,
      },
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
escrowSchema.index({ orderId: 1 });
escrowSchema.index({ buyerId: 1 });
escrowSchema.index({ vendorId: 1 });
escrowSchema.index({ status: 1 });
escrowSchema.index({ confirmationDeadline: 1 }); // New index for auto-release
escrowSchema.index({ autoReleaseDate: 1 });
escrowSchema.index({ createdAt: -1 });

// Set auto-release date when escrow is funded
escrowSchema.pre("save", function (next: any) {
  if (this.isModified("status") && this.status === "funded" && !this.autoReleaseDate) {
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + this.releaseConditions.autoReleaseAfterDays);
    this.autoReleaseDate = releaseDate;
    this.fundedAt = new Date();
  }
  next();
});

export default mongoose.models.Escrow || mongoose.model("Escrow", escrowSchema);