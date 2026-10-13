import express from "express";
import { scanPass } from "../controllers/passController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/scan", authMiddleware, scanPass);
export default router;
