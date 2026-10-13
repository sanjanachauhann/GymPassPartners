import Partner from "../models/Partner.js";
import Pass from "../models/Pass.js";

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    const user = await Partner.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = name;
    user.email = email;
    user.phone = phone;

    await user.save();

    res.json({
      user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await Pass.deleteMany({
      memberId: req.user.id,
    });

    await User.findByIdAndDelete(req.user.id);

    res.json({
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server error",
    });
  }
};
