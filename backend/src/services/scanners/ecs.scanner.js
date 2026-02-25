import {
  ECSClient,
  ListClustersCommand,
  ListServicesCommand,
  DescribeServicesCommand,
} from "@aws-sdk/client-ecs";

import ResourceInventory from "../../models/resourceInventory.model.js";

export const scanECS = async (credentials, region, orgId, accountId) => {
  const client = new ECSClient({ region, credentials });

  let totalCount = 0;

  const clustersData = await client.send(
    new ListClustersCommand({})
  );

  for (const clusterArn of clustersData.clusterArns || []) {
    totalCount++;

    // Save cluster
    await ResourceInventory.findOneAndUpdate(
      { resourceId: clusterArn, cloudAccount: accountId },
      {
        organization: orgId,
        cloudAccount: accountId,
        resourceType: "ECS_CLUSTER",
        resourceId: clusterArn,
        region,
        metadata: {},
      },
      { upsert: true }
    );

    // Get services in cluster
    const servicesData = await client.send(
      new ListServicesCommand({ cluster: clusterArn })
    );

    if (servicesData.serviceArns?.length > 0) {
      const describeData = await client.send(
        new DescribeServicesCommand({
          cluster: clusterArn,
          services: servicesData.serviceArns,
        })
      );

      for (const service of describeData.services || []) {
        totalCount++;

        await ResourceInventory.findOneAndUpdate(
          { resourceId: service.serviceArn, cloudAccount: accountId },
          {
            organization: orgId,
            cloudAccount: accountId,
            resourceType: "ECS_SERVICE",
            resourceId: service.serviceArn,
            region,
            metadata: {
              desiredCount: service.desiredCount,
              runningCount: service.runningCount,
              launchType: service.launchType,
            },
          },
          { upsert: true }
        );
      }
    }
  }

  return totalCount;
};