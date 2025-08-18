import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
    },
    company: {
      type: String,
      default: null,
    },
    street: {
      type: String,
      required: [true, "Street address is required"],
    },
    apartment: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      default: "Sierra Leone",
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    coordinates: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    deliveryInstructions: {
      type: String,
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
addressSchema.index({ userId: 1 });
addressSchema.index({ isDefault: 1 });

// Ensure only one default address per user
addressSchema.pre("save", async function (next: any) {
  if (this.isDefault) {
    await mongoose.model("Address").updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export default mongoose.models.Address || mongoose.model("Address", addressSchema);