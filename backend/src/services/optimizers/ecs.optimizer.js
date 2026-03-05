import {
  ECSClient,
  ListClustersCommand,
  ListServicesCommand,
  DescribeServicesCommand,
} from "@aws-sdk/client-ecs";

export const optimizeECS = async (credentials, region) => {
  const ecsClient = new ECSClient({ region, credentials });
  const recommendations = [];

  const clusters = await ecsClient.send(
    new ListClustersCommand({})
  );

  for (const clusterArn of clusters.clusterArns || []) {
    const services = await ecsClient.send(
      new ListServicesCommand({ cluster: clusterArn })
    );

    if (!services.serviceArns.length) {
      recommendations.push({
        resourceId: clusterArn,
        resourceType: "ECS",
        severity: "LOW",
        message: "ECS cluster has no running services.",
        estimatedMonthlySavings: 10,
      });
      continue;
    }

    const described = await ecsClient.send(
      new DescribeServicesCommand({
        cluster: clusterArn,
        services: services.serviceArns,
      })
    );

    for (const service of described.services || []) {
      if (service.runningCount === 0) {
        recommendations.push({
          resourceId: service.serviceName,
          resourceType: "ECS",
          severity: "MEDIUM",
          message:
            "ECS service has 0 running tasks. Consider deleting.",
          estimatedMonthlySavings: 15,
        });
      }
    }
  }

  return recommendations;
};