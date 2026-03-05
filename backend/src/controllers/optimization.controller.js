import CloudAccount from "../models/cloudAccount.model.js";
import { assumeCustomerRole } from "../utils/awsClient.js";
import { runOptimization } from "../services/optimization.service.js";

export const triggerOptimization = async (req, res) => {
  try {
    const { cloudAccountId } = req.body;

    if (!cloudAccountId) {
      return res.status(400).json({
        success: false,
        message: "Cloud account ID is required",
      });
    }

    /* -------------------------------
       Get Cloud Account
    --------------------------------*/
    const cloudAccount = await CloudAccount.findById(cloudAccountId);

    if (!cloudAccount) {
      return res.status(404).json({
        success: false,
        message: "Cloud account not found",
      });
    }

    /* -------------------------------
       Assume AWS Role
    --------------------------------*/
    const credentials = await assumeCustomerRole(
      cloudAccount.roleArn,
      cloudAccount.externalId,
      cloudAccount.region
    );

    /* -------------------------------
       Run Optimization
    --------------------------------*/
    const result = await runOptimization(
      credentials,
      cloudAccount.region,
      cloudAccount.organization,
      cloudAccount._id
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Optimization Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "Optimization failed",
      error: error.message,
    });
  }
};