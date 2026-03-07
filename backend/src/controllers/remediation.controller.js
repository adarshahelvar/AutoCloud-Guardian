import CloudAccount from "../models/cloudAccount.model.js";
import { assumeCustomerRole } from "../utils/awsClient.js";
import {
  runAutoRemediation,
  fixSingleRecommendation,
} from "../services/remediation.service.js";

export const triggerRemediation = async (req, res) => {
  try {
    const { cloudAccountId } = req.body;

    if (!cloudAccountId) {
      return res.status(400).json({
        success: false,
        message: "cloudAccountId is required",
      });
    }

    const account = await CloudAccount.findById(cloudAccountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Cloud account not found",
      });
    }

    const credentials = await assumeCustomerRole(
      account.roleArn,
      account.externalId,
      account.region
    );

    const result = await runAutoRemediation(
      credentials,
      account.region,
      account._id
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Remediation failed",
      error: error.message,
    });
  }
};

export const fixOneRecommendation = async (req, res) => {
  try {
    const { cloudAccountId, recommendationId } = req.body;

    if (!cloudAccountId || !recommendationId) {
      return res.status(400).json({
        success: false,
        message: "cloudAccountId and recommendationId are required",
      });
    }

    const account = await CloudAccount.findById(cloudAccountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Cloud account not found",
      });
    }

    const credentials = await assumeCustomerRole(
      account.roleArn,
      account.externalId,
      account.region
    );

    const result = await fixSingleRecommendation(
      credentials,
      account.region,
      recommendationId,
      account._id
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fix recommendation",
      error: error.message,
    });
  }
};