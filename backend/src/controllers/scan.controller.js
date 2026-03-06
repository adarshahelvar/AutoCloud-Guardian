import CloudAccount from "../models/cloudAccount.model.js";

import { assumeCustomerRole } from "../utils/awsClient.js";
import { scanAllRegions } from "../services/aws.scan.service.js";
import { generateRecommendations } from "../services/recommendation.engine.js";

import { getMonthlyCost } from "../services/costAnalyzer.service.js";
import { predictNextMonthCost } from "../services/costPrediction.service.js";
import { checkBudgetAlert } from "../services/alert.service.js";

export const runFullAwsScan = async (req, res) => {
  try {

    const { cloudAccountId } = req.body;

    // ===============================
    // Get Cloud Account
    // ===============================
    const cloudAccount = await CloudAccount.findById(cloudAccountId);

    if (!cloudAccount) {
      return res.status(404).json({
        success: false,
        message: "Cloud account not found"
      });
    }

    // organizationId comes from DB
    const organizationId = cloudAccount.organization;

    // ===============================
    // Assume AWS Role
    // ===============================
    const credentials = await assumeCustomerRole(
      cloudAccount.roleArn,
      cloudAccount.externalId,
      cloudAccount.region
    );

    // ===============================
    // Scan AWS Resources
    // ===============================
    const scanResults = await scanAllRegions(credentials);

    console.log("SCAN RESULTS:");
console.log(JSON.stringify(scanResults, null, 2));

    // ===============================
    // Generate Recommendations
    // ===============================
    const recommendations = await generateRecommendations(
      organizationId,
      cloudAccountId,
      scanResults
    );

    // ===============================
    // Cost Analysis
    // ===============================
    const currentCost = await getMonthlyCost(credentials);

    // ===============================
    // Cost Prediction
    // ===============================
    const predictedCost = await predictNextMonthCost(currentCost);

    // ===============================
    // Budget Alert
    // ===============================
    const alert = await checkBudgetAlert(
      cloudAccount.alertEmail || "admin@company.com",
      predictedCost,
      recommendations
    );

    res.status(200).json({
      message: "AWS Scan completed",
      resourcesFound: scanResults.length,
      recommendationsCreated: recommendations.length,
      currentCost,
      predictedCost,
      alert
    });

  } catch (error) {

    console.error("Scan Error:", error);

    res.status(500).json({
      success: false,
      message: "AWS Scan failed",
      error: error.message
    });

  }
};