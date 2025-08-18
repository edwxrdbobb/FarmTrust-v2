import mongoose from "mongoose";

const farmerRequestSchema = new mongoose.Schema(
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
    farmerType: {
      type: String,
      enum: ["organic", "waste-to-resource", "fish", "cattle"],
      required: [true, "Farmer type is required"],
    },
    documents: [{
      type: String, // URLs to uploaded documents
      required: true,
    }],
    businessLicense: {
      type: String,
      default: null,
    },
    identificationDocument: {
      type: String,
      default: null,
    },
    farmCertificates: [{
      type: String,
    }],
    contactPhone: {
      type: String,
      required: [true, "Contact phone is required"],
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0,
    },
    farmSize: {
      value: { type: Number, default: null },
      unit: { type: String, enum: ["acres", "hectares", "sq_meters"], default: "acres" },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "more-info-needed"],
      default: "pending",
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
    rejectionReason: {
      type: String,
      default: null,
    },
    reviewedAt: {
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
farmerRequestSchema.index({ status: 1 });
farmerRequestSchema.index({ createdAt: -1 });
farmerRequestSchema.index({ farmerType: 1 });

export default mongoose.models.FarmerRequest || mongoose.model("FarmerRequest", farmerRequestSchema);