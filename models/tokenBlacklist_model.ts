import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expires_at: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Create index for automatic cleanup of expired tokens
tokenBlacklistSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.TokenBlacklist ||
  mongoose.model("TokenBlacklist", tokenBlacklistSchema);