import mongoose from "mongoose";
import Gym from "../models/Gym.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import * as cashfreeService from "../services/cashfreeService.js";
import {
  PASS_DAYS,
  calculateSplit,
  issuePassForOrder,
} from "../services/passPurchaseService.js";

// Step 1 - member taps "Pay" for a pass at a gym.
// The client only sends WHICH gym and WHICH pass. The price, the vendor and the
// split all come from our database, so none of it can be tampered with.
export const createPassOrder = async (req, res) => {
  try {
    const { gymId, passType } = req.body;

    if (!mongoose.isValidObjectId(gymId) || !PASS_DAYS[passType]) {
      return res
        .status(400)
        .json({ success: false, message: "Choose a valid gym and pass." });
    }

    const [gym, member] = await Promise.all([
      Gym.findById(gymId),
      User.findById(req.user.id),
    ]);

    if (!gym || !member) {
      return res
        .status(404)
        .json({ success: false, message: "Gym or account not found." });
    }

    const price = Number(gym.passes?.[passType]);

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "This pass is not available at this gym.",
      });
    }

    if (!gym.cashfreeVendorId || gym.payoutAccountStatus !== "ACTIVE") {
      return res.status(409).json({
        success: false,
        message: "This gym can't accept payments yet.",
      });
    }

    if (!member.phone) {
      return res.status(400).json({
        success: false,
        message: "Add a phone number to your profile to pay.",
      });
    }

    const { platformFee, vendorAmount } = calculateSplit(price);
    const orderId = `pass_${Date.now()}_${String(member._id).slice(-6)}`;

    const order = await cashfreeService.createOrder({
      orderId,
      amount: price,
      customerId: String(member._id),
      customerName: member.name || "GymPass member",
      customerEmail: member.email || "member@gympass.app",
      customerPhone: member.phone,
      // Gym's Cashfree vendor receives vendorAmount; the rest stays with us.
      orderSplits: [{ vendor_id: gym.cashfreeVendorId, amount: vendorAmount }],
      notifyUrl: process.env.CASHFREE_WEBHOOK_URL,
    });

    await Payment.create({
      orderId,
      amount: price,
      status: "PENDING",
      purpose: "PASS_PURCHASE",
      memberId: member._id,
      gymId: gym._id,
      passType,
      vendorId: gym.cashfreeVendorId,
      vendorAmount,
      platformFee,
    });

    return res.json({
      success: true,
      order: {
        orderId,
        paymentSessionId: order.payment_session_id,
        amount: price,
        gymName: gym.gymName,
      },
    });
  } catch (error) {
    console.log(
      "Create pass order error:",
      error?.response?.data || error?.message,
    );

    return res.status(500).json({
      success: false,
      message: error?.response?.data?.message || "Could not start payment.",
    });
  }
};

// Step 3 - app calls this after the Cashfree screen closes. We never trust the
// app's word that it paid: we ask Cashfree, and only then issue the pass.
export const verifyPassPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const payment = await Payment.findOne({
      orderId,
      purpose: "PASS_PURCHASE",
      memberId: req.user.id,
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const order = await cashfreeService.fetchOrder(orderId);

    if (order.order_status !== "PAID") {
      return res.json({ success: false, status: order.order_status });
    }

    const pass = await issuePassForOrder(orderId);

    return res.json({ success: true, status: "PAID", pass });
  } catch (error) {
    console.log(
      "Verify pass payment error:",
      error?.response?.data || error?.message,
    );

    return res
      .status(500)
      .json({ success: false, message: "Could not verify payment." });
  }
};
