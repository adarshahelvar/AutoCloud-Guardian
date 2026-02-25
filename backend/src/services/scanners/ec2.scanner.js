import {
  EC2Client,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";
import ResourceInventory from "../../models/resourceInventory.model.js";

export const scanEC2 = async (credentials, region, orgId, accountId) => {
  const client = new EC2Client({ region, credentials });
  const data = await client.send(new DescribeInstancesCommand({}));

  let count = 0;

  for (const reservation of data.Reservations || []) {
    for (const instance of reservation.Instances || []) {
      count++;

      await ResourceInventory.findOneAndUpdate(
        { resourceId: instance.InstanceId, cloudAccount: accountId },
        {
          organization: orgId,
          cloudAccount: accountId,
          resourceType: "EC2",
          resourceId: instance.InstanceId,
          region,
          metadata: {
            instanceType: instance.InstanceType,
            state: instance.State?.Name,
            vpcId: instance.VpcId,
            subnetId: instance.SubnetId,
            launchTime: instance.LaunchTime,
          },
        },
        { upsert: true }
      );
    }
  }

  return count;
};