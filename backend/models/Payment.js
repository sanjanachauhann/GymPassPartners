import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "PENDING" },
    // REGISTRATION_FEE (partner pays us) | PASS_PURCHASE (member pays a gym)
    purpose: { type: String, default: "REGISTRATION_FEE" },

    // Only used for PASS_PURCHASE. Stored server-side so the pass that gets
    // issued is always the one that was paid for, never what the client claims.
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: "gyms" },
    passType: { type: String },
    vendorId: { type: String },
    vendorAmount: { type: Number },
    platformFee: { type: Number },
    passId: { type: mongoose.Schema.Types.ObjectId, ref: "Pass" },
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);
