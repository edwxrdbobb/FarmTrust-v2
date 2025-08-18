import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
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
    reason: {
      type: String,
      enum: [
        "quality-issues",
        "wrong-item",
        "missing-item",
        "damaged",
        "late-delivery",
        "other"
      ],
      required: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    evidence: [{
      type: String, // URLs to uploaded evidence files
    }],
    status: {
      type: String,
      enum: [
        "open",
        "under-review",
        "resolved-buyer",
        "resolved-vendor",
        "closed"
      ],
      default: "open",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
    },
    resolution: {
      type: String,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    resolvedAt: {
      type: Date,
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
disputeSchema.index({ orderId: 1 });
disputeSchema.index({ buyerId: 1 });
disputeSchema.index({ vendorId: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ createdAt: -1 });

export default mongoose.models.Dispute || mongoose.model("Dispute", disputeSchema);