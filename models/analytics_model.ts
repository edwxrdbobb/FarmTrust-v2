import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "daily_sales",
        "monthly_sales",
        "product_views",
        "user_activity",
        "vendor_performance",
        "order_metrics",
        "revenue_metrics",
        "customer_metrics"
      ],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    // Sales metrics
    totalSales: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    averageOrderValue: {
      type: Number,
      default: 0,
    },
    // User metrics
    newUsers: {
      type: Number,
      default: 0,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    returningUsers: {
      type: Number,
      default: 0,
    },
    // Product metrics
    productViews: {
      type: Number,
      default: 0,
    },
    uniqueProductViews: {
      type: Number,
      default: 0,
    },
    // Vendor metrics
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      default: null,
    },
    vendorSales: {
      type: Number,
      default: 0,
    },
    vendorRevenue: {
      type: Number,
      default: 0,
    },
    vendorOrders: {
      type: Number,
      default: 0,
    },
    // Product-specific metrics
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    productSales: {
      type: Number,
      default: 0,
    },
    productRevenue: {
      type: Number,
      default: 0,
    },
    // Category metrics
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    categorySales: {
      type: Number,
      default: 0,
    },
    categoryRevenue: {
      type: Number,
      default: 0,
    },
    // Additional metrics
    conversionRate: {
      type: Number,
      default: 0,
    },
    bounceRate: {
      type: Number,
      default: 0,
    },
    pageViews: {
      type: Number,
      default: 0,
    },
    sessionDuration: {
      type: Number,
      default: 0,
    },
    // Custom metrics
    customMetrics: {
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
analyticsSchema.index({ type: 1 });
analyticsSchema.index({ date: 1 });
analyticsSchema.index({ period: 1 });
analyticsSchema.index({ vendorId: 1 });
analyticsSchema.index({ productId: 1 });
analyticsSchema.index({ categoryId: 1 });

// Compound indexes for common queries
analyticsSchema.index({ type: 1, date: -1 });
analyticsSchema.index({ type: 1, period: 1, date: -1 });
analyticsSchema.index({ vendorId: 1, type: 1, date: -1 });
analyticsSchema.index({ productId: 1, type: 1, date: -1 });
analyticsSchema.index({ categoryId: 1, type: 1, date: -1 });

// Unique constraint to prevent duplicate entries
analyticsSchema.index(
  { type: 1, date: 1, period: 1, vendorId: 1, productId: 1, categoryId: 1 },
  { unique: true, sparse: true }
);

export default mongoose.models.Analytics || mongoose.model("Analytics", analyticsSchema);