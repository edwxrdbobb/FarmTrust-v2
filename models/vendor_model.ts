import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    farmName: {
      type: String,
      required: [true, "Farm name is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    coverImage: {
      type: String,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    farmerType: {
      type: String,
      enum: ["organic", "waste-to-resource", "fish", "cattle"],
      required: [true, "Farmer type is required"],
    },
    businessLicense: {
      type: String,
      default: null,
    },
    certifications: [{
      type: String,
    }],
    socialMedia: {
      facebook: { type: String, default: null },
      instagram: { type: String, default: null },
      twitter: { type: String, default: null },
    },
    bankDetails: {
      accountName: { type: String, default: null },
      accountNumber: { type: String, default: null },
      bankName: { type: String, default: null },
      routingNumber: { type: String, default: null },
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
vendorSchema.index({ verified: 1 });
vendorSchema.index({ farmerType: 1 });
vendorSchema.index({ rating: -1 });

export default mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);