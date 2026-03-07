import mongoose from "mongoose";
import Recommendation from "../models/recommendation.model.js";
import { cleanupDuplicateRecommendations } from "../services/recommendationCleanup.service.js";

export const getRecommendations = async (req, res) => {
  try {
    let { cloudAccountId } = req.query;

    if (!cloudAccountId) {
      return res.status(400).json({
        success: false,
        message: "cloudAccountId is required",
      });
    }

    cloudAccountId = cloudAccountId.trim();

    if (!mongoose.Types.ObjectId.isValid(cloudAccountId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cloudAccountId",
      });
    }

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

export const cleanupRecommendations = async (req, res) => {
  try {
    const { cloudAccountId } = req.body;

    if (!cloudAccountId) {
      return res.status(400).json({
        success: false,
        message: "cloudAccountId is required",
      });
    }

    const result = await cleanupDuplicateRecommendations(cloudAccountId);

    res.status(200).json({
      success: true,
      message: "Duplicate recommendations cleaned successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clean duplicate recommendations",
      error: error.message,
    });
  }
};