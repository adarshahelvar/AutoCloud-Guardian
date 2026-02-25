import {
  ElasticLoadBalancingV2Client,
  DescribeLoadBalancersCommand,
} from "@aws-sdk/client-elastic-load-balancing-v2";
import ResourceInventory from "../../models/resourceInventory.model.js";

export const scanELB = async (credentials, region, orgId, accountId) => {
  const client = new ElasticLoadBalancingV2Client({ region, credentials });
  const data = await client.send(new DescribeLoadBalancersCommand({}));

  let count = 0;

  for (const lb of data.LoadBalancers || []) {
    count++;

    await ResourceInventory.findOneAndUpdate(
      { resourceId: lb.LoadBalancerArn, cloudAccount: accountId },
      {
        organization: orgId,
        cloudAccount: accountId,
        resourceType: "ELB",
        resourceId: lb.LoadBalancerArn,
        region,
        metadata: {
          type: lb.Type,
          scheme: lb.Scheme,
          state: lb.State?.Code,
        },
      },
      { upsert: true }
    );
  }

  return count;
};