import CloudAccount from "../models/cloudAccount.model.js";
import { assumeCustomerRole } from "../utils/awsClient.js";
import { getMonthlyCost } from "../services/costAnalyzer.service.js";

export const getCostAnalysis = async (req, res) => {
  try {
    const { cloudAccountId } = req.body;

    const cloudAccount = await CloudAccount.findById(cloudAccountId);

    if (!cloudAccount) {
      return res.status(404).json({
        success: false,
        message: "Cloud account not found",
      });
    }

    const credentials = await assumeCustomerRole(
      cloudAccount.roleArn,
      cloudAccount.externalId,
      cloudAccount.region
    );

    const costData = await getMonthlyCost(credentials);

    res.status(200).json({
      success: true,
      data: costData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cost analysis failed",
      error: error.message,
    });
  }
};