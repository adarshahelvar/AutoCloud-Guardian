import {
  EKSClient,
  ListClustersCommand,
  DescribeClusterCommand,
  ListNodegroupsCommand,
  DescribeNodegroupCommand,
} from "@aws-sdk/client-eks";

import ResourceInventory from "../../models/resourceInventory.model.js";

export const scanEKS = async (credentials, region, orgId, accountId) => {
  const client = new EKSClient({ region, credentials });

  let totalCount = 0;

  const clustersData = await client.send(
    new ListClustersCommand({})
  );

  for (const clusterName of clustersData.clusters || []) {
    const clusterDetail = await client.send(
      new DescribeClusterCommand({ name: clusterName })
    );

    totalCount++;

    await ResourceInventory.findOneAndUpdate(
      { resourceId: clusterDetail.cluster.arn, cloudAccount: accountId },
      {
        organization: orgId,
        cloudAccount: accountId,
        resourceType: "EKS_CLUSTER",
        resourceId: clusterDetail.cluster.arn,
        region,
        metadata: {
          status: clusterDetail.cluster.status,
          version: clusterDetail.cluster.version,
        },
      },
      { upsert: true }
    );

    // Node groups
    const nodeGroups = await client.send(
      new ListNodegroupsCommand({ clusterName })
    );

    for (const nodeGroupName of nodeGroups.nodegroups || []) {
      const nodeGroupDetail = await client.send(
        new DescribeNodegroupCommand({
          clusterName,
          nodegroupName: nodeGroupName,
        })
      );

      totalCount++;

      await ResourceInventory.findOneAndUpdate(
        {
          resourceId: nodeGroupDetail.nodegroup.nodegroupArn,
          cloudAccount: accountId,
        },
        {
          organization: orgId,
          cloudAccount: accountId,
          resourceType: "EKS_NODEGROUP",
          resourceId: nodeGroupDetail.nodegroup.nodegroupArn,
          region,
          metadata: {
            status: nodeGroupDetail.nodegroup.status,
            instanceTypes:
              nodeGroupDetail.nodegroup.instanceTypes,
            scalingConfig:
              nodeGroupDetail.nodegroup.scalingConfig,
          },
        },
        { upsert: true }
      );
    }
  }

  return totalCount;
};