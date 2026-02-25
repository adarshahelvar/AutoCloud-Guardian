import {
  RDSClient,
  DescribeDBInstancesCommand,
} from "@aws-sdk/client-rds";
import ResourceInventory from "../../models/resourceInventory.model.js";

export const scanRDS = async (credentials, region, orgId, accountId) => {
  const client = new RDSClient({ region, credentials });
  const data = await client.send(new DescribeDBInstancesCommand({}));

  let count = 0;

  for (const db of data.DBInstances || []) {
    count++;

    await ResourceInventory.findOneAndUpdate(
      { resourceId: db.DBInstanceIdentifier, cloudAccount: accountId },
      {
        organization: orgId,
        cloudAccount: accountId,
        resourceType: "RDS",
        resourceId: db.DBInstanceIdentifier,
        region,
        metadata: {
          engine: db.Engine,
          status: db.DBInstanceStatus,
          instanceClass: db.DBInstanceClass,
          allocatedStorage: db.AllocatedStorage,
        },
      },
      { upsert: true }
    );
  }

  return count;
};