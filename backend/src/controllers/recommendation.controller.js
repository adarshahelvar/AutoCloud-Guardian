import Recommendation from "../models/recommendation.model.js";

export const getRecommendations = async (req, res) => {
  try {
    const { cloudAccountId } = req.query;

    const recommendations = await Recommendation.find({
      organization: req.user.organizationId,
      cloudAccount: cloudAccountId,
      status: "OPEN",
    }).sort({ createdAt: -1 });

    const totalEstimatedSavings = recommendations.reduce(
      (sum, rec) => sum + (rec.estimatedMonthlySavings || 0),
      0
    );

    res.status(200).json({
      success: true,
      totalRecommendations: recommendations.length,
      totalEstimatedSavings,
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recommendations",
      error: error.message,
    });
  }
};