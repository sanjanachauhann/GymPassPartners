import Gym from "../models/Gym.js";
import Pass from "../models/Pass.js";
import mongoose from "mongoose";

export const scanPass = async (passId, partnerId) => {
  if (!mongoose.Types.ObjectId.isValid(passId)) {
    const error = new Error("Invalid pass ID");
    error.statusCode = 400;
    throw error;
  }

  const pass = await Pass.findById(passId);

  if (!pass) {
    throw new Error("Pass not found");
  }

  const gym = await Gym.findById(pass.gymId);

  if (gym?.partnerId && partnerId && gym.partnerId.toString() !== partnerId) {
    const error = new Error("This pass is for another gym");
    error.statusCode = 403;
    throw error;
  }

  const isExpired = pass.expiryDate && pass.expiryDate < new Date();
  const isInactive = pass.active === false || pass.isActive === false;

  if (isExpired || isInactive) {
    if (isExpired && (pass.active || pass.isActive)) {
      pass.active = false;
      pass.isActive = false;
      await pass.save();
    }

    const error = new Error(isExpired ? "Pass has expired" : "Pass is not active");
    error.statusCode = 410;
    throw error;
  }

  return pass;
};
