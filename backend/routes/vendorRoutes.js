import express from "express";
import * as vendorController from "../controllers/vendorController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/:gymId/payout-account",
  authMiddleware,
  vendorController.setupPayoutAccount,
);
router.get(
  "/:gymId/payout-account",
  authMiddleware,
  vendorController.getPayoutAccountStatus,
);

export default router;
