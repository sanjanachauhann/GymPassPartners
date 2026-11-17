import Partner from "../models/Partner.js";

export const updateProfile = async (req, res) => {
  try {
    const { ownerName, name, email, phone, photo } = req.body;
    const updatedName = ownerName ?? name;

    const user = await Partner.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (updatedName !== undefined) user.ownerName = updatedName;
    user.email = email;
    user.phone = phone;
    if (photo !== undefined) user.photo = photo;

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
    const deletedPartner = await Partner.findByIdAndDelete(req.user.id);

    if (!deletedPartner) {
      return res.status(404).json({
        message: "Partner account not found",
      });
    }

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
