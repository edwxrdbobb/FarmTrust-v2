import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Vendor",
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 0,
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: ["kg", "lb", "piece", "bunch", "bag", "box", "liter", "gallon"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    images: [{
      type: String,
    }],
    available: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    organic: {
      type: Boolean,
      default: false,
    },
    harvestDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    nutritionalInfo: {
      calories: { type: Number, default: null },
      protein: { type: Number, default: null },
      carbs: { type: Number, default: null },
      fat: { type: Number, default: null },
      fiber: { type: Number, default: null },
    },
    tags: [{
      type: String,
    }],
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
    totalSold: {
      type: Number,
      default: 0,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for performance
productSchema.index({ vendorId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ available: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ organic: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ name: "text", description: "text" });

export default mongoose.models.Product || mongoose.model("Product", productSchema);