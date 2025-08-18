import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: function(this: any): boolean {
        return this.auth_provider === 'local';
      },
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function(this: any): boolean {
        return this.auth_provider === "local";
      },
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "vendor", "buyer"],
      default: "buyer",
    },
    auth_provider: {
      type: String,
      required: true,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    profileImage: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    preferences: {
      notifications: {
        orderUpdates: { type: Boolean, default: true },
        promotions: { type: Boolean, default: true },
        farmerUpdates: { type: Boolean, default: false },
        smsNotifications: { type: Boolean, default: true },
      },
      language: { type: String, default: "en" },
      region: { type: String, default: "western" },
      currency: { type: String, default: "leone" },
      privacy: {
        profileVisibility: { type: Boolean, default: true },
        dataCollection: { type: Boolean, default: true },
        thirdPartyMarketing: { type: Boolean, default: false },
      },
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for performance
userSchema.index({ role: 1 });
userSchema.index({ email: 1 });
userSchema.index({ verified: 1 });

// Hash password before saving
userSchema.pre("save", async function (next: any) {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to validate password
userSchema.methods.validatePassword = async function (password: string) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);