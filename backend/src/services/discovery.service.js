import {
  EC2Client,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";

import ResourceInventory from "../models/resourceInventory.model.js";

export const runDiscovery = async (
  credentials,
  region,
  organizationId,
  cloudAccountId
) => {
  const ec2Client = new EC2Client({
    region,
    credentials,
  });

  const command = new DescribeInstancesCommand({});
  const response = await ec2Client.send(command);

  const activeInstanceIds = [];
  let ec2Count = 0;

  for (const reservation of response.Reservations || []) {
    for (const instance of reservation.Instances || []) {
      ec2Count++;
      activeInstanceIds.push(instance.InstanceId);

      await ResourceInventory.findOneAndUpdate(
        {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceType: "EC2",
          resourceId: instance.InstanceId,
        },
        {
          region,
          metadata: {
            state: instance.State?.Name,
            instanceType: instance.InstanceType,
            launchTime: instance.LaunchTime,
          },
          lastScannedAt: new Date(),
        },
        {
          upsert: true,
          new: true,
        }
      );
    }
  }

  // Mark terminated
  await ResourceInventory.updateMany(
    {
      organization: organizationId,
      cloudAccount: cloudAccountId,
      resourceType: "EC2",
      resourceId: { $nin: activeInstanceIds },
    },
    {
      $set: {
        "metadata.state": "terminated",
        lastScannedAt: new Date(),
      },
    }
  );

  return {
    ec2: ec2Count,
  };
};