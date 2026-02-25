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

    res.status(200).json({
      success: true,
      totalIdle: idleInstances.length,
      data: idleInstances,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Idle detection failed",
      error: error.message,
    });
  }
};