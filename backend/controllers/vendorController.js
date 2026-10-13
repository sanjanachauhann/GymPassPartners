import Gym from "../models/Gym.js";
import * as cashfreeService from "../services/cashfreeService.js";

export const setupPayoutAccount = async (req, res) => {
  try {
    const { gymId } = req.params;
    const {
      accountHolder,
      accountNumber,
      ifsc,
      panNumber,
      name,
      email,
      phoneNumber,
    } = req.body;

    console.log("gettting here", phoneNumber);

    const vendorId = `gym_${gymId}`;

    const vendor = await cashfreeService.createVendor({
      vendorId,
      name,
      email,
      phoneNumber,
      panNumber,
      bank: { accountHolder, accountNumber, ifsc },
    });

    await Gym.findByIdAndUpdate(gymId, {
      cashfreeVendorId: vendorId,
      payoutAccountStatus: vendor.status,
    });

    res.json({ success: true, vendorStatus: vendor.status });
  } catch (error) {
    const cashfreeError = error?.response?.data;

    console.error(
      "Cashfree vendor setup error:",
      cashfreeError || error?.message || error,
    );

    return res.status(400).json({
      success: false,
      code: cashfreeError?.code || "PAYMENT_SETUP_FAILED",
      message: cashfreeError?.message || "Could not set up payout account",
      type: cashfreeError?.type || "unknown_error",
    });
  }
};

export const getPayoutAccountStatus = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.gymId);
    if (!gym?.cashfreeVendorId)
      return res.json({ success: true, status: "NOT_SETUP" });

    const vendor = await cashfreeService.fetchVendor(gym.cashfreeVendorId);
    res.json({ success: true, status: vendor.status });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
