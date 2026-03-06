import CloudAccount from "../models/cloudAccount.model.js";
import { assumeCustomerRole } from "../utils/awsClient.js";
import { scanAllRegions } from "../services/aws.scan.service.js";
import { generateRecommendations } from "../services/recommendation.engine.js";

export const runFullAwsScan = async (req, res) => {
  try {
    const { cloudAccountId } = req.body;

    if (!cloudAccountId) {
      return res.status(400).json({
        success: false,
        message: "cloudAccountId is required",
      });
    }

    /* Get Cloud Account */
    const cloudAccount = await CloudAccount.findById(cloudAccountId);

    if (!cloudAccount) {
      return res.status(404).json({
        success: false,
        message: "Cloud account not found",
      });
    }

    console.log("🔐 Assuming AWS Role...");

    const credentials = await assumeCustomerRole(
      cloudAccount.roleArn,
      cloudAccount.externalId,
      cloudAccount.region
    );

    console.log("🚀 Starting full AWS scan...");

    /* Scan AWS */
    const scanResults = await scanAllRegions(credentials);

    console.log("📊 Scan completed. Resources found:", scanResults.length);

    /* Generate recommendations */
    const recommendations = await generateRecommendations(
      cloudAccount.organization,
      cloudAccount._id,
      scanResults
    );

    res.json({
      success: true,
      message: "AWS Scan completed",
      resourcesFound: scanResults.length,
      recommendationsCreated: recommendations.length,
    });

  } catch (error) {
    console.error("❌ Scan Error:", error);

    res.status(500).json({
      success: false,
      message: "Scan failed",
      error: error.message,
    });
  }
};