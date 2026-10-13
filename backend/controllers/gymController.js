import Gym from "../models/Gym.js";
import Pass from "../models/Pass.js";
import User from "../models/User.js";
// ============================================
// GET GYM BY PARTNER ID
// ============================================

export const getGymByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.params;

    console.log("=================================");
    console.log("GET GYM BY PARTNER");
    console.log("PARTNER ID:", partnerId);
    console.log("=================================");

    const gym = await Gym.findOne({
      partnerId,
    });

    console.log("FOUND GYM:", gym);

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found for this partner",
      });
    }

    return res.status(200).json({
      success: true,
      gym,
    });
  } catch (error) {
    console.error("Get gym error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get gym",
    });
  }
};

// ============================================
// GET MEMBERS OF A GYM
// ============================================

export const getGymMembers = async (req, res) => {
  try {
    const { gymId } = req.params;

    console.log("=================================");
    console.log("GET GYM MEMBERS");
    console.log("GYM ID:", gymId);
    console.log("=================================");

    // 1. Make sure gym exists
    const gym = await Gym.findById(gymId);

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    // 2. Find all passes belonging to this gym
    const passes = await Pass.find({
      gymId: gymId,
    }).sort({
      expiryDate: 1,
    });

    console.log("PASSES FOUND:", passes.length);

    // 3. Get unique member IDs
    const memberIds = [
      ...new Set(passes.map((pass) => pass.memberId.toString())),
    ];

    // 4. Fetch those users
    const users = await User.find({
      _id: { $in: memberIds },
    }).select("_id name email phone photo");

    console.log("USERS FOUND:", users.length);

    // 5. Attach passes to users
    const members = users.map((user) => {
      const userPasses = passes.filter(
        (pass) => pass.memberId.toString() === user._id.toString(),
      );

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photo: user.photo,

        passes: userPasses.map((pass) => ({
          _id: pass._id,
          gymId: pass.gymId,
          gymName: pass.gymName,
          passType: pass.passType,
          validityDays: pass.validityDays,
          price: pass.price,
          purchaseDate: pass.purchaseDate,
          expiryDate: pass.expiryDate,
          status: pass.status,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      gymId: gym._id,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Get gym members error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get gym members",
      error: error.message,
    });
  }
};

// ============================================
// UPDATE GYM PASS PRICES
// ============================================

export const updateGymPasses = async (req, res) => {
  try {
    const { gymId } = req.params;
    const { passes } = req.body;

    console.log("=================================");
    console.log("UPDATE GYM PASSES");
    console.log("GYM ID:", gymId);
    console.log("NEW PASSES:", passes);
    console.log("=================================");

    const gym = await Gym.findById(gymId);

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: "Gym not found",
      });
    }

    gym.passes = passes;

    await gym.save();

    console.log("UPDATED GYM:", gym);

    return res.status(200).json({
      success: true,
      gym,
    });
  } catch (error) {
    console.error("Update gym passes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update gym passes",
    });
  }
};
