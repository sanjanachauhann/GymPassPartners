// import mongoose from "mongoose";

// const passSchema = new mongoose.Schema(
//   {
//     memberId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     gymId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Gym",
//       required: true,
//     },

//     gymName: {
//       type: String,
//       required: true,
//     },

//     price: {
//       type: Number,
//       required: true,
//     },

//     duration: {
//       type: Number,
//       required: true,
//     },

//     passType: {
//       type: String,
//       default: "daily",
//     },

//     purchaseDate: {
//       type: Date,
//       default: Date.now,
//     },

//     expiryDate: {
//       type: Date,
//       required: true,
//     },

//     active: {
//       type: Boolean,
//       default: true,
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     qrCode: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export default mongoose.model("Pass", passSchema);
import mongoose from "mongoose";

const passSchema = new mongoose.Schema(
  {
    // User who owns the pass
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Gym
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
      index: true,
    },

    gymName: {
      type: String,
      required: true,
    },

    // daily | weekly | monthly | yearly
    passType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },

    validityDays: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Pass", passSchema);
