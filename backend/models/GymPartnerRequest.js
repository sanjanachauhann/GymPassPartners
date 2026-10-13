import mongoose from "mongoose";

const GymPartnerRequestSchema = new mongoose.Schema(
  {
    // partnerId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Partner",
    //   required: true,
    // },

    ownerName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    placeId: {
      type: String,
      required: true,
    },

    gymName: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    rating: {
      type: Number,
      default: 0,
    },

    photos: [
      {
        type: String,
      },
    ],

    passes: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      yearly: Number,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("GymPartnerRequest", GymPartnerRequestSchema);
