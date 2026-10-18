import Gym from "../models/Gym.js";
import * as cashfreeService from "../services/cashfreeService.js";

const sendCashfreeError = (res, error, fallback) => {
  console.error(
    "Cashfree vendor error:",
    error?.response?.data || error?.message || error,
  );

  return res.status(error?.response?.status || 400).json({
    success: false,
    message: error?.response?.data?.message || error?.message || fallback,
    code: error?.response?.data?.code,
  });
};

const validateDetails = (body) => {
  const required = [
    "accountHolder",
    "accountNumber",
    "ifsc",
    "panNumber",
    "email",
    "phoneNumber",
  ];

  if (required.some((key) => !String(body[key] || "").trim())) {
    return "Please complete all bank, PAN, email and phone details.";
  }

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(body.ifsc.trim())) {
    return "Please enter a valid IFSC code.";
  }

  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(body.panNumber.trim())) {
    return "Please enter a valid PAN number.";
  }

  return null;
};

const getGym = (gymId) => Gym.findById(gymId);

// export const setupPayoutAccount = async (req, res) => {
//   try {
//     const gym = await getGym(req.params.gymId);

//     if (!gym) {
//       return res.status(404).json({
//         success: false,
//         message: "Gym not found.",
//       });
//     }

//     if (gym.cashfreeVendorId && gym.payoutAccountStatus !== "DELETED") {
//       return res.status(409).json({
//         success: false,
//         message: "A Cashfree vendor already exists. Edit that request instead.",
//       });
//     }

//     const error = validateDetails(req.body);

//     if (error) {
//       return res.status(400).json({
//         success: false,
//         message: error,
//       });
//     }

//     const vendorId = `gym_${gym._id}`;

//     const vendor = await cashfreeService.createVendor({
//       vendorId,
//       name: gym.gymName,
//       email: req.body.email.trim(),
//       phoneNumber: req.body.phoneNumber.trim(),
//       panNumber: req.body.panNumber.trim().toUpperCase(),
//       bank: {
//         accountHolder: req.body.accountHolder.trim(),
//         accountNumber: req.body.accountNumber.trim(),
//         ifsc: req.body.ifsc.trim().toUpperCase(),
//       },
//     });

//     gym.cashfreeVendorId = vendorId;
//     gym.payoutAccountStatus = vendor.status || "ACTIVE";
//     await gym.save();

//     return res.json({
//       success: true,
//       vendorId,
//       status: gym.payoutAccountStatus,
//     });
//   } catch (error) {
//     return sendCashfreeError(
//       res,
//       error,
//       "Could not create the Cashfree vendor.",
//     );
//   }
// };

export const setupPayoutAccount = async (req, res) => {
  try {
    const {
      accountHolder,
      accountNumber,
      ifsc,
      panNumber,
      name,
      email,
      phoneNumber,
    } = req.body;

    const gym = await getGym(req.params.gymId);

    console.log("gym detaisl is here", gym);

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found.",
      });
    }

    if (gym.cashfreeVendorId && gym.payoutAccountStatus !== "DELETED") {
      return res.status(409).json({
        success: false,
        message: "A Cashfree vendor already exists. Edit that request instead.",
      });
    }

    const error = validateDetails(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    if (!String(name || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Vendor name is required.",
      });
    }

    const vendorId = `gym_${gym._id}`;

    const vendor = await cashfreeService.createVendor({
      vendorId,
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      panNumber: panNumber.trim().toUpperCase(),
      bank: {
        accountHolder: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase(),
      },
    });

    gym.cashfreeVendorId = vendorId;
    gym.payoutAccountStatus = vendor.status || "ACTIVE";
    await gym.save();

    return res.json({
      success: true,
      vendorId,
      status: gym.payoutAccountStatus,
    });
  } catch (error) {
    return sendCashfreeError(
      res,
      error,
      "Could not create the Cashfree vendor.",
    );
  }
};

export const getPayoutAccountStatus = async (req, res) => {
  try {
    const gym = await getGym(req.params.gymId);

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found.",
      });
    }

    if (!gym.cashfreeVendorId) {
      return res.json({
        success: true,
        exists: false,
        status: "NOT_SETUP",
      });
    }

    // If Cashfree fails, return an error; do not pretend
    // that the existing vendor does not exist.
    const vendor = await cashfreeService.fetchVendor(gym.cashfreeVendorId);

    const status = vendor.status || gym.payoutAccountStatus || "UNKNOWN";

    gym.payoutAccountStatus = status;
    await gym.save();

    return res.json({
      success: true,
      exists: status !== "DELETED",
      vendorId: gym.cashfreeVendorId,
      status,
    });
  } catch (error) {
    return sendCashfreeError(
      res,
      error,
      "Could not retrieve the Cashfree vendor status.",
    );
  }
};

export const updatePayoutAccount = async (req, res) => {
  try {
    const gym = await getGym(req.params.gymId);

    if (!gym || !gym.cashfreeVendorId) {
      return res.status(404).json({
        success: false,
        message: "No Cashfree vendor was found.",
      });
    }

    if (gym.payoutAccountStatus === "DELETED") {
      return res.status(409).json({
        success: false,
        message: "This vendor was deleted. Create a new request instead.",
      });
    }

    const error = validateDetails(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }

    const vendor = await cashfreeService.updateVendor(gym.cashfreeVendorId, {
      name: gym.gymName,
      email: req.body.email.trim(),
      phoneNumber: req.body.phoneNumber.trim(),
      accountHolder: req.body.accountHolder.trim(),
      accountNumber: req.body.accountNumber.trim(),
      ifsc: req.body.ifsc.trim().toUpperCase(),
      panNumber: req.body.panNumber.trim().toUpperCase(),
    });

    gym.payoutAccountStatus = vendor.status || gym.payoutAccountStatus;

    await gym.save();

    return res.json({
      success: true,
      status: gym.payoutAccountStatus,
    });
  } catch (error) {
    return sendCashfreeError(
      res,
      error,
      "Could not update the Cashfree vendor.",
    );
  }
};

export const deletePayoutAccount = async (req, res) => {
  try {
    const gym = await getGym(req.params.gymId);

    if (!gym || !gym.cashfreeVendorId) {
      return res.status(404).json({
        success: false,
        message: "No Cashfree vendor was found.",
      });
    }

    // Fetch the existing vendor first, so required details are
    // not fabricated or lost when marking it as DELETED.
    const existingVendor = await cashfreeService.fetchVendor(
      gym.cashfreeVendorId,
    );

    const vendor = await cashfreeService.markVendorDeleted(
      gym.cashfreeVendorId,
      existingVendor,
    );

    // Persist only after Cashfree accepts the update.
    gym.payoutAccountStatus = vendor.status || "DELETED";
    await gym.save();

    return res.json({
      success: true,
      status: gym.payoutAccountStatus,
    });
  } catch (error) {
    return sendCashfreeError(
      res,
      error,
      "Could not delete the Cashfree vendor.",
    );
  }
};
// import Gym from "../models/Gym.js";
// import * as cashfreeService from "../services/cashfreeService.js";

// export const setupPayoutAccount = async (req, res) => {
//   try {
//     const { gymId } = req.params;
//     const {
//       accountHolder,
//       accountNumber,
//       ifsc,
//       panNumber,
//       name,
//       email,
//       phoneNumber,
//     } = req.body;

//     console.log("gettting here", phoneNumber);

//     const vendorId = `gym_${gymId}`;

//     const vendor = await cashfreeService.createVendor({
//       vendorId,
//       name,
//       email,
//       phoneNumber,
//       panNumber,
//       bank: { accountHolder, accountNumber, ifsc },
//     });

//     await Gym.findByIdAndUpdate(gymId, {
//       cashfreeVendorId: vendorId,
//       payoutAccountStatus: vendor.status,
//     });

//     res.json({ success: true, vendorStatus: vendor.status });
//   } catch (error) {
//     const cashfreeError = error?.response?.data;

//     console.error(
//       "Cashfree vendor setup error:",
//       cashfreeError || error?.message || error,
//     );

//     return res.status(400).json({
//       success: false,
//       code: cashfreeError?.code || "PAYMENT_SETUP_FAILED",
//       message: cashfreeError?.message || "Could not set up payout account",
//       type: cashfreeError?.type || "unknown_error",
//     });
//   }
// };

// export const getPayoutAccountStatus = async (req, res) => {
//   try {
//     const gym = await Gym.findById(req.params.gymId);
//     if (!gym?.cashfreeVendorId)
//       return res.json({ success: true, status: "NOT_SETUP" });

//     const vendor = await cashfreeService.fetchVendor(gym.cashfreeVendorId);
//     res.json({ success: true, status: vendor.status });
//   } catch (err) {
//     res.status(500).json({ success: false });
//   }
// };
