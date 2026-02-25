import CloudAccount from "../models/cloudAccount.model.js";
import { assumeCustomerRole } from "../utils/awsClient.js";
import { detectIdleEC2 } from "../services/idleDetector.service.js";

export const runIdleCheck = async (req, res) => {
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

    const idleInstances = await detectIdleEC2(
      credentials,
      cloudAccount.region,
      req.user.organizationId,
      cloudAccount._id
    );

    // ✅ If no idle instances
    if (!idleInstances || idleInstances.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No running or idle EC2 instances found",
        totalIdle: 0,
        data: [],
      });
    }

    // ✅ If idle instances found
    return res.status(200).json({
      success: true,
      message: "Idle EC2 instances detected",
      totalIdle: idleInstances.length,
      data: idleInstances,
    });

  } catch (error) {
    console.error("Idle detection error:", error);

    return res.status(500).json({
      success: false,
      message: "Idle detection failed",
      error: error.message,
    });
  }
};