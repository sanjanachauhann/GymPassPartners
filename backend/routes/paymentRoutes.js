import express from "express";
import * as paymentController from "../controllers/paymentController.js";

const router = express.Router();

router.post("/cashfree/create-order", paymentController.createOrder);

router.post("/cashfree/verify", paymentController.verifyPayment);
router.post("/cashfree/webhook", paymentController.handleWebhook);

export default router;
