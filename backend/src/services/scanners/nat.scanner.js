import {
  EC2Client,
  DescribeNatGatewaysCommand,
} from "@aws-sdk/client-ec2";
import ResourceInventory from "../../models/resourceInventory.model.js";

export const scanNAT = async (credentials, region, orgId, accountId) => {
  const client = new EC2Client({ region, credentials });
  const data = await client.send(new DescribeNatGatewaysCommand({}));

  let count = 0;

  for (const nat of data.NatGateways || []) {
    count++;

    await ResourceInventory.findOneAndUpdate(
      { resourceId: nat.NatGatewayId, cloudAccount: accountId },
      {
        organization: orgId,
        cloudAccount: accountId,
        resourceType: "NAT",
        resourceId: nat.NatGatewayId,
        region,
        metadata: {
          state: nat.State,
          subnetId: nat.SubnetId,
        },
      },
      { upsert: true }
    );
  }

  return count;
};