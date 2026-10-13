import * as passService from "../services/passService.js";

export const scanPass = async (req, res) => {
  try {
    const { passId } = req.body;

    const pass = await passService.scanPass(passId, req.user?.id);

    return res.json({
      success: true,
      message: "Pass validated",
      pass,
    });
  } catch (err) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
    });
  }
};
