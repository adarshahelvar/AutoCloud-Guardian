import CloudAccount from "../models/cloudAccount.model.js";
import { assumeCustomerRole } from "../utils/awsClient.js";

import { getMonthlyCost } from "../services/costAnalyzer.service.js";
import { predictNextMonthCost } from "../services/costPrediction.service.js";
import { checkBudgetAlert } from "../services/alert.service.js";

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

    /* Assume AWS role */
    const credentials = await assumeCustomerRole(
      cloudAccount.roleArn,
      cloudAccount.externalId,
      cloudAccount.region
    );

    /* Get current cost */
    const costData = await getMonthlyCost(credentials);

    /* Predict next month cost */
    const prediction = await predictNextMonthCost(costData.totalCost);

    /* Check budget alert */
    const alert = await checkBudgetAlert(
      cloudAccount.organization,
      costData.totalCost
    );

    res.status(200).json({
      success: true,
      cost: costData,
      prediction,
      alert,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cost analysis failed",
      error: error.message,
    });
  }
};