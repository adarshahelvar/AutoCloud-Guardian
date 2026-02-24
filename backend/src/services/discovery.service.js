import CloudAccount from "../models/cloudAccount.model.js";
import ResourceInventory from "../models/resourceInventory.model.js";
import { assumeCustomerRole } from "../utils/awsClient.js";
import { scanEC2 } from "./ec2.scanner.js";

export const runDiscovery = async (cloudAccountId) => {
  const cloudAccount = await CloudAccount.findById(cloudAccountId);

  const credentials = await assumeCustomerRole(
    cloudAccount.roleArn,
    cloudAccount.externalId,
    cloudAccount.region,
  );

  // 1️⃣ Scan EC2
  const ec2Resources = await scanEC2(cloudAccount.region, credentials);

  // 2️⃣ Clear old inventory
  await ResourceInventory.deleteMany({
    cloudAccount: cloudAccount._id,
  });

  // 3️⃣ Save new inventory
  await ResourceInventory.insertMany(
    ec2Resources.map((r) => ({
      ...r,
      organization: cloudAccount.organization,
      cloudAccount: cloudAccount._id,
    })),
  );

  return {
    success: true,
    total: ec2Resources.length,
  };
};
