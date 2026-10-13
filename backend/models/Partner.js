import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["invited", "active"],
      default: "invited",
    },

    inviteToken: String,

    inviteExpires: Date,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Partner", PartnerSchema);

// import mongoose from "mongoose";

// const gymPartnerSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: {
//       type: String,
//       unique: true,
//     },
//     password: String,

//     gymId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Gym",
//     },

//     googlePlaceId: String,

//     status: {
//       type: String,
//       default: "pending", // pending, approved, rejected
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// export default mongoose.model("Partners", gymPartnerSchema);
