import { compare, hash } from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";

import { deleteAccount, updateProfile } from "../controllers/userController.js";
import Partner from "../models/Partner.js";

const { sign } = jwt;
const router = Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // CHECK EXISTING USER
    const existingUser = await Partner.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Partner already exists",
      });
    }

    // HASH PASSWORD
    const hashedPassword = await hash(password, 10);

    // CREATE USER
    const user = await Partner.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    // TOKEN
    const token = sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      },
    );

    res.json({
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  console.log("reach ereer");
  try {
    const { email, password } = req.body;

    // FIND USER
    const user = await Partner.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Partner not found",
      });
    }

    // CHECK PASSWORD
    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    // TOKEN
    const token = sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      },
    );

    res.json({
      token,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

//update
router.put("/profile", authMiddleware, updateProfile);

//delete
router.delete("/delete", authMiddleware, deleteAccount);

router.post("/activate", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Partner.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Partner not found",
      });
    }

    if (user.status === "active") {
      return res.status(400).json({
        message: "Account already activated",
      });
    }

    const hashedPassword = await hash(password, 10);

    user.password = hashedPassword;
    user.status = "active";
    user.inviteToken = null;
    user.inviteExpires = null;

    await user.save();

    res.json({
      success: true,
      message: "Account activated successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/setup-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Partner.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Partner not found",
      });
    }

    if (user.password) {
      return res.status(400).json({
        message: "Password already created.",
      });
    }

    const hashedPassword = await hash(password, 10);

    user.password = hashedPassword;
    user.status = "active";

    await user.save();

    res.json({
      success: true,
      message: "Password created successfully.",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;
