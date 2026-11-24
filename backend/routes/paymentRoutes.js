import express from "express";
import * as passCheckoutController from "../controllers/passCheckoutController.js";
import * as paymentController from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Partner registration fee
router.post("/cashfree/create-order", paymentController.createOrder);
router.post("/cashfree/verify", paymentController.verifyPayment);

// Member buys a pass (money is split to the gym's Cashfree vendor)
router.post(
  "/cashfree/pass/create-order",
  authMiddleware,
  passCheckoutController.createPassOrder,
);
router.post(
  "/cashfree/pass/verify",
  authMiddleware,
  passCheckoutController.verifyPassPayment,
);

// NOTE: the Cashfree webhook is mounted in server.js with express.raw(),
// because the signature is computed over the raw request body.

export default router;
