import {
  RDSClient,
  DescribeDBInstancesCommand,
} from "@aws-sdk/client-rds";

import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from "@aws-sdk/client-cloudwatch";

export const optimizeRDS = async (credentials, region) => {
  const rdsClient = new RDSClient({ region, credentials });
  const cwClient = new CloudWatchClient({ region, credentials });

  const recommendations = [];

  const dbs = await rdsClient.send(
    new DescribeDBInstancesCommand({})
  );

  for (const db of dbs.DBInstances || []) {
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(endTime.getDate() - 7);

    const metrics = await cwClient.send(
      new GetMetricStatisticsCommand({
        Namespace: "AWS/RDS",
        MetricName: "CPUUtilization",
        Dimensions: [
          {
            Name: "DBInstanceIdentifier",
            Value: db.DBInstanceIdentifier,
          },
        ],
        StartTime: startTime,
        EndTime: endTime,
        Period: 86400,
        Statistics: ["Average"],
      })
    );

    const datapoints = metrics.Datapoints || [];
    if (!datapoints.length) continue;

    const avgCpu =
      datapoints.reduce((s, d) => s + d.Average, 0) /
      datapoints.length;

    if (avgCpu < 10) {
      recommendations.push({
        resourceId: db.DBInstanceIdentifier,
        resourceType: "RDS",
        severity: "MEDIUM",
        message: "RDS instance underutilized. Consider downsizing.",
        estimatedMonthlySavings: 20,
      });
    }
  }

  return recommendations;
};