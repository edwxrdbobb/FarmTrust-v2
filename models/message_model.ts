import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Conversation",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    attachments: [{
      type: {
        type: String,
        enum: ["image", "document", "other"],
      },
      url: { type: String, required: true },
      filename: { type: String, required: true },
      size: { type: Number, default: 0 },
      mimeType: { type: String, default: null },
    }],
    readBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
    editedAt: {
      type: Date,
      default: null,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    systemMessageType: {
      type: String,
      enum: [
        "order_created",
        "order_updated",
        "payment_received",
        "dispute_opened",
        "dispute_resolved",
        "user_joined",
        "user_left"
      ],
      default: null,
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
messageSchema.index({ conversationId: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ type: 1 });
messageSchema.index({ "readBy.userId": 1 });

// Compound index for conversation messages ordered by time
messageSchema.index({ conversationId: 1, createdAt: -1 });

// Update conversation's lastMessage when a new message is created
messageSchema.post("save", async function (this: any) {
  if (this.type !== "system") {
    await mongoose.model("Conversation").findByIdAndUpdate(
      this.conversationId,
      {
        lastMessage: {
          content: this.content,
          senderId: this.senderId,
          timestamp: this.createdAt,
        },
        updatedAt: new Date(),
      }
    );
  }
});

export default mongoose.models.Message || mongoose.model("Message", messageSchema);