import { runOptimization } from "../services/optimization.service.js";

export const triggerOptimization = async (req, res) => {
  try {
    const { cloudAccountId } = req.body;

    const result = await runOptimization(
      req.user.organizationId,
      cloudAccountId
    );

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Optimization failed",
      error: error.message,
    });
  }
};