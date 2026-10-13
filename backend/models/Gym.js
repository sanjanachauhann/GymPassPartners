import mongoose from "mongoose";
const gymSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },

    placeId: {
      type: String,
      required: true,
      unique: true,
    },

    gymName: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    rating: Number,

    passes: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      yearly: Number,
    },
    razorpayAccountId: {
      type: String,
      default: null,
    },

    razorpayAccountStatus: {
      type: String,
      enum: ["NOT_CONNECTED", "PENDING", "ACTIVE", "REJECTED"],
      default: "NOT_CONNECTED",
    },
    razorpayProductId: {
      type: String,
      default: null,
    },
    cashfreeVendorId: {
      type: String,
      default: null,
    },

    payoutAccountStatus: {
      type: String,
      enum: [
        "NOT_SETUP",
        "IN_BENE_CREATION",
        "ACTIVE",
        "ON_HOLD",
        "BLOCKED",
        "REJECTED",
        "DELETED",
      ],
      default: "NOT_SETUP",
    },
  },

  {
    timestamps: true,
  },
);
export default mongoose.model("gyms", gymSchema);
