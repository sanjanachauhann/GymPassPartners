import { Router } from "express";
import GymPartnerRequest from "../models/GymPartnerRequest.js";

const router = Router();

router.post("/signup", async (req, res) => {
  console.log("hit it");
  console.log("BODY: hit it", req.body);
  // console.log("partnerId:", req.body.partnerId);

  try {
    const {
      // partnerId,
      ownerName,
      email,
      phone,
      placeId,
      gymName,
      address,
      rating,
      photos,
      passes,
    } = req.body;

    // Check if a request already exists for this partner
    const existingRequest = await GymPartnerRequest.findOne({
      email,
      phone,
      placeId,
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: "A request has already been submitted for this partner.",
        request: existingRequest,
      });
    }

    const request = await GymPartnerRequest.create({
      // partnerId,
      ownerName,
      email,
      phone,
      placeId,
      gymName,
      address,
      rating: rating || 0,
      photos: photos || [],
      passes: {
        daily: Number(passes.daily),
        weekly: Number(passes.weekly),
        monthly: Number(passes.monthly),
        yearly: Number(passes.yearly),
      },
    });
    res.status(201).json({
      success: true,
      message: "Gym partner request submitted successfully.",
      request,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/:id", async (req, res) => {
  const request = await GymPartnerRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: "Request not found",
    });
  }

  res.json({
    success: true,
    request,
  });
});

export default router;
