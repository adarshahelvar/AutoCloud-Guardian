import {
  EKSClient,
  ListClustersCommand,
  ListNodegroupsCommand,
  DescribeNodegroupCommand,
} from "@aws-sdk/client-eks";

export const optimizeEKS = async (credentials, region) => {
  const eksClient = new EKSClient({ region, credentials });
  const recommendations = [];

  const clusters = await eksClient.send(
    new ListClustersCommand({})
  );

  for (const clusterName of clusters.clusters || []) {
    const nodegroups = await eksClient.send(
      new ListNodegroupsCommand({ clusterName })
    );

    if (!nodegroups.nodegroups.length) {
      recommendations.push({
        resourceId: clusterName,
        resourceType: "EKS",
        severity: "MEDIUM",
        message: "EKS cluster has no node groups.",
        estimatedMonthlySavings: 40,
      });
      continue;
    }

    for (const ng of nodegroups.nodegroups) {
      const details = await eksClient.send(
        new DescribeNodegroupCommand({
          clusterName,
          nodegroupName: ng,
        })
      );

      if (details.nodegroup.scalingConfig.desiredSize === 0) {
        recommendations.push({
          resourceId: ng,
          resourceType: "EKS",
          severity: "HIGH",
          message:
            "Node group desired size is 0. Cluster may be unused.",
          estimatedMonthlySavings: 50,
        });
      }
    }
  }

  return recommendations;
};