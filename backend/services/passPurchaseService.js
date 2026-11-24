import Gym from "../models/Gym.js";
import Pass from "../models/Pass.js";
import Payment from "../models/Payment.js";

export const PASS_DAYS = { daily: 1, weekly: 7, monthly: 30, yearly: 365 };

const roundMoney = (value) => Math.round(value * 100) / 100;

// Splits a pass price between the gym (vendor) and the platform.
// PLATFORM_FEE_PERCENT defaults to 0, i.e. the gym receives the full amount.
export const calculateSplit = (price) => {
  const feePercent = Number(process.env.PLATFORM_FEE_PERCENT || 0);
  const platformFee = roundMoney((price * feePercent) / 100);
  const vendorAmount = roundMoney(price - platformFee);

  return { platformFee, vendorAmount };
};

// Called once Cashfree confirms the order is PAID. Safe to call any number of
// times (webhook retries, app verify call, both at once): it always returns the
// same single pass for the order.
export const issuePassForOrder = async (orderId) => {
  const payment = await Payment.findOne({ orderId });

  if (!payment || payment.purpose !== "PASS_PURCHASE") {
    return null;
  }

  const existing = await Pass.findOne({ orderId });

  if (existing) {
    return existing;
  }

  await Payment.updateOne({ orderId }, { status: "PAID" });

  const gym = await Gym.findById(payment.gymId);

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + PASS_DAYS[payment.passType]);

  try {
    const pass = await Pass.create({
      memberId: payment.memberId,
      gymId: payment.gymId,
      gymName: gym?.gymName || "Gym",
      passType: payment.passType,
      validityDays: PASS_DAYS[payment.passType],
      price: payment.amount,
      expiryDate,
      orderId,
    });

    await Payment.updateOne({ orderId }, { passId: pass._id });

    return pass;
  } catch (error) {
    // Another request issued the pass a split second earlier.
    if (error?.code === 11000) {
      return Pass.findOne({ orderId });
    }

    throw error;
  }
};
