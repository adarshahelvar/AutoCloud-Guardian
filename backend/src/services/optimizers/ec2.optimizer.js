import {
  EC2Client,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";

import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from "@aws-sdk/client-cloudwatch";

export const optimizeEC2 = async (credentials, region) => {
  const ec2Client = new EC2Client({ region, credentials });
  const cwClient = new CloudWatchClient({ region, credentials });

  const recommendations = [];

  const ec2Data = await ec2Client.send(
    new DescribeInstancesCommand({})
  );

  for (const reservation of ec2Data.Reservations || []) {
    for (const instance of reservation.Instances || []) {
      if (instance.State.Name !== "running") continue;

      const endTime = new Date();
      const startTime = new Date();
      startTime.setDate(endTime.getDate() - 7);

      const metrics = await cwClient.send(
        new GetMetricStatisticsCommand({
          Namespace: "AWS/EC2",
          MetricName: "CPUUtilization",
          Dimensions: [
            {
              Name: "InstanceId",
              Value: instance.InstanceId,
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
        datapoints.reduce((sum, p) => sum + p.Average, 0) /
        datapoints.length;

      if (avgCpu < 5) {
        recommendations.push({
          resourceId: instance.InstanceId,
          resourceType: "EC2",
          severity: "HIGH",
          message:
            "Low CPU utilization (<5%) for 7 days. Consider stopping or resizing.",
          estimatedMonthlySavings: 25,
        });
      }
    }
  }

  return recommendations;
};