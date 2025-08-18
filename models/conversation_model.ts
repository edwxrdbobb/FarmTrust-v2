import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    }],
    type: {
      type: String,
      enum: ["buyer_vendor", "buyer_admin", "vendor_admin", "support"],
      default: "buyer_vendor",
    },
    title: {
      type: String,
      default: null,
    },
    relatedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    relatedDisputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dispute",
      default: null,
    },
    lastMessage: {
      content: { type: String, default: null },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      timestamp: { type: Date, default: null },
    },
    status: {
      type: String,
      enum: ["active", "archived", "closed"],
      default: "active",
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
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
conversationSchema.index({ participants: 1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ relatedOrderId: 1 });
conversationSchema.index({ relatedDisputeId: 1 });
conversationSchema.index({ "lastMessage.timestamp": -1 });
conversationSchema.index({ updatedAt: -1 });

// Compound index for finding conversations between specific users
conversationSchema.index({ participants: 1, type: 1 });

export default mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);