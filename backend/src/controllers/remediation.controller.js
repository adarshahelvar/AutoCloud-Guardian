import CloudAccount from "../models/cloudAccount.model.js";
import { assumeCustomerRole } from "../utils/awsClient.js";
import { runAutoRemediation } from "../services/remediation.service.js";

export const triggerRemediation = async (req, res) => {
  try {
    const { cloudAccountId } = req.body;

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