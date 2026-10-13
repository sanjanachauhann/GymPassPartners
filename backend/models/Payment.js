import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "PENDING" },
    purpose: { type: String, default: "REGISTRATION_FEE" },
  },
  { timestamps: true },
);

export default mongoose.model("Payment", paymentSchema);
