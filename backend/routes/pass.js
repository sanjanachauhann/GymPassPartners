import express from "express";
import mongoose from "mongoose";

import Gym from "../models/Gym.js";
import Pass from "../models/Pass.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const passDurations = {
  day: 1,
  week: 7,
  month: 30,
  quarterly: 90,
  yearly: 365,
};

const normalizePassType = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  return passDurations[normalized] ? normalized : null;
};

const toInteger = (value) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const buildExpiryDate = (duration) => {
  const expiry = new Date();

  expiry.setDate(expiry.getDate() + duration);

  return expiry;
};

const getPassIdFromBody = (body) => {
  if (typeof body?.passId === "string") {
    return body.passId.trim();
  }

  if (typeof body?.qrData === "string") {
    try {
      const parsed = JSON.parse(body.qrData);

      if (typeof parsed?.passId === "string") {
        return parsed.passId.trim();
      }
    } catch {
      return body.qrData.replace(/^gympass-/, "").trim();
    }
  }

  return null;
};

const markExpiredPasses = async (memberId) => {
  await Pass.updateMany(
    {
      memberId,
      expiryDate: { $lt: new Date() },
      $or: [{ active: true }, { isActive: true }],
    },
    {
      active: false,
      isActive: false,
    },
  );
};

const resolveGym = async ({ gymId, gymName }) => {
  if (gymId) {
    const gym = await Gym.findById(gymId);

    if (gym) {
      return gym;
    }
  }

  if (typeof gymName !== "string" || !gymName.trim()) {
    return null;
  }

  const trimmedGymName = gymName.trim();
  const existingGym = await Gym.findOne({
    gymName: new RegExp(
      `^${trimmedGymName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
      "i",
    ),
  });

  if (existingGym) {
    return existingGym;
  }

  return Gym.create({
    googlePlaceId: `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    gymName: trimmedGymName,
  });
};

// BUY PASS
router.post("/buy", authMiddleware, async (req, res) => {
  try {
    console.log("/buy...");
    const { gymId, gymName, passType } = req.body;
    const price = toInteger(req.body.price);
    const normalizedPassType = normalizePassType(passType);
    const duration = normalizedPassType
      ? passDurations[normalizedPassType]
      : null;

    if (!price || !duration) {
      return res.status(400).json({
        message: "Valid price and pass duration are required",
      });
    }

    const gym = await resolveGym({ gymId, gymName });

    if (!gym) {
      return res.status(404).json({
        message: "Gym not found",
      });
    }

    const expiry = buildExpiryDate(duration);

    const pass = await Pass.create({
      memberId: req.user.id,

      gymId: gym._id,

      gymName: gym.gymName,

      price,

      duration,

      passType: normalizedPassType,

      expiryDate: expiry,

      active: true,

      isActive: true,
    });

    res.json(pass);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// GET ACTIVE PASSES
router.get("/active", authMiddleware, async (req, res) => {
  try {
    await markExpiredPasses(req.user.id);

    const passes = await Pass.find({
      memberId: req.user.id,

      active: true,
    }).sort({
      createdAt: -1,
    });

    res.json(passes);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// GET ALL PASSES
router.get("/", authMiddleware, async (req, res) => {
  try {
    await markExpiredPasses(req.user.id);

    const passes = await Pass.find({
      memberId: req.user.id,
    }).sort({
      createdAt: -1,
    });

    res.json(passes);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// VALIDATE PASS FROM PARTNER QR SCAN
router.post("/scan", authMiddleware, async (req, res) => {
  try {
    const passId = getPassIdFromBody(req.body);
    console.log("Pass scan requested:", {
      passId,
      partnerId: req.user?.id,
    });

    if (!passId) {
      return res.status(400).json({
        success: false,
        message: "Pass ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(passId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pass ID",
      });
    }

    const pass = await Pass.findById(passId);

    if (!pass) {
      return res.status(404).json({
        success: false,
        message: "Pass not found",
      });
    }

    const gym = await Gym.findById(pass.gymId);

    if (
      gym?.partnerId &&
      req.user?.id &&
      gym.partnerId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "This pass is for another gym",
      });
    }

    const now = new Date();
    const isExpired = pass.expiryDate && pass.expiryDate < now;
    const isInactive = pass.active === false || pass.isActive === false;

    if (isExpired || isInactive) {
      if (isExpired && (pass.active || pass.isActive)) {
        pass.active = false;
        pass.isActive = false;
        await pass.save();
      }

      return res.status(410).json({
        success: false,
        message: isExpired ? "Pass has expired" : "Pass is not active",
        pass,
      });
    }

    return res.json({
      success: true,
      message: "Pass validated successfully",
      pass,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
