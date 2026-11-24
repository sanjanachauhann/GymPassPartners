import crypto from "node:crypto";
import Payment from "../models/Payment.js";
import * as cashfreeService from "../services/cashfreeService.js";
import { issuePassForOrder } from "../services/passPurchaseService.js";

// export const createOrder = async (req, res) => {
//   try {
//     const { amount, name, email, phone } = req.body;
//     console.log(amount, name, email, phone);
//     const orderId = `order_${Date.now()}`;

//     const order = await cashfreeService.createOrder({
//       orderId,
//       amount,
//       customerName: name,
//       customerEmail: email,
//       customerPhone: phone,
//     });

//     await Payment.create({
//       orderId,
//       amount,
//       status: "PENDING",
//       purpose: "REGISTRATION_FEE",
//     });

//     res.json({
//       success: true,
//       order: { orderId, paymentSessionId: order.payment_session_id },
//     });
//   } catch (err) {
//     console.log(err?.response?.data || err.message);
//     res.status(500).json({ success: false, message: "Could not create order" });
//   }
// };

export const createOrder = async (req, res) => {
  try {
    const { amount, customerName, customerEmail, customerPhone } = req.body;

    console.log("Create order request:", {
      amount,
      customerName,
      customerEmail,
      customerPhone,
    });

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment amount",
      });
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: "Customer details are required",
      });
    }

    const orderId = `order_${Date.now()}`;

    const order = await cashfreeService.createOrder({
      orderId,
      amount: numericAmount,
      customerName,
      customerEmail,
      customerPhone,
    });

    await Payment.create({
      orderId,
      amount: numericAmount,
      status: "PENDING",
      purpose: "REGISTRATION_FEE",
    });

    res.json({
      success: true,
      order: {
        orderId,
        paymentSessionId: order.payment_session_id,
      },
    });
  } catch (err) {
    console.log(
      "Cashfree create order error:",
      err?.response?.data || err.message,
    );

    res.status(500).json({
      success: false,
      message: err?.response?.data?.message || "Could not create order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await cashfreeService.fetchOrder(orderId);
    const isPaid = order.order_status === "PAID";

    await Payment.findOneAndUpdate(
      { orderId },
      { status: isPaid ? "PAID" : order.order_status },
    );
    res.json({ success: isPaid, orderId });
  } catch (err) {
    console.log(err?.response?.data || err.message);
    res.status(500).json({ success: false });
  }
};

// Cashfree signs the RAW request body, so this handler must be mounted with
// express.raw() (see server.js), not express.json().
const isValidWebhookSignature = (rawBody, headers) => {
  const timestamp = headers["x-webhook-timestamp"];
  const received = headers["x-webhook-signature"];

  if (!timestamp || !received || !process.env.CASHFREE_CLIENT_SECRET) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", process.env.CASHFREE_CLIENT_SECRET)
    .update(timestamp + rawBody)
    .digest("base64");

  const a = Buffer.from(expected);
  const b = Buffer.from(received);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

export const handleWebhook = async (req, res) => {
  try {
    const rawBody = req.body.toString("utf8");

    if (!isValidWebhookSignature(rawBody, req.headers)) {
      return res.sendStatus(401);
    }

    const { data } = JSON.parse(rawBody);
    const orderId = data?.order?.order_id;
    const status = data?.payment?.payment_status;

    if (orderId && status === "SUCCESS") {
      await Payment.findOneAndUpdate({ orderId }, { status: "PAID" });
      // Pass purchases: this is what actually issues the pass, even if the
      // member closed the app before it could call /verify.
      await issuePassForOrder(orderId);
    } else if (orderId && status === "FAILED") {
      // Never overwrite an order that already succeeded.
      await Payment.findOneAndUpdate(
        { orderId, status: { $ne: "PAID" } },
        { status: "FAILED" },
      );
    }

    res.sendStatus(200);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};
