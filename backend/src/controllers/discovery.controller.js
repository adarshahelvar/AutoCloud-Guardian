// import { runDiscovery } from "../services/discovery.service.js";

// export const triggerDiscovery = async (req, res) => {
//   try {
//     const { cloudAccountId } = req.body;

//     const result = await runDiscovery(cloudAccountId);

//     res.json(result);
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

import CloudAccount from "../models/cloudAccount.model.js";
import { assumeCustomerRole } from "../utils/awsClient.js";
import { runDiscovery } from "../services/discovery.service.js";

export const triggerDiscovery = async (req, res) => {
  try {
    const { cloudAccountId } = req.body;

    const cloudAccount = await CloudAccount.findById(cloudAccountId);

    if (!cloudAccount) {
      return res.status(404).json({
        success: false,
        message: "Cloud account not found",
      });
    }

    // Assume role
    const credentials = await assumeCustomerRole(
      cloudAccount.roleArn,
      cloudAccount.externalId,
      cloudAccount.region,
    );

    // Run discovery
    const results = await runDiscovery(
      credentials,
      cloudAccount.region,
      cloudAccount.organization,
      cloudAccount._id,
    );

    res.status(200).json({
      success: true,
      message: "Discovery completed",
      data: results,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Discovery failed",
      error: error.message,
    });
  }
};
