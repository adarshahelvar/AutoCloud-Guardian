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

  const endTime = new Date();
  const startTime = new Date();
  startTime.setDate(endTime.getDate() - 7);

  const metricPromises = [];

  for (const reservation of ec2Data.Reservations || []) {
    for (const instance of reservation.Instances || []) {

      if (instance.State.Name !== "running") continue;

      metricPromises.push(

        cwClient
          .send(
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
          )
          .then((metrics) => ({
            instance,
            metrics,
          }))

      );

    }
  }

  const results = await Promise.all(metricPromises);

  for (const result of results) {

    const datapoints = result.metrics.Datapoints || [];
    if (!datapoints.length) continue;

    const avgCpu =
      datapoints.reduce((sum, p) => sum + p.Average, 0) /
      datapoints.length;

    if (avgCpu < 5) {

      recommendations.push({
        resourceId: result.instance.InstanceId,
        resourceType: "EC2",
        severity: "HIGH",
        message:
          "Instance has <5% CPU utilization for 7 days",
        recommendation:
          avgCpu < 2
            ? "Stop instance"
            : "Consider resizing instance",
        estimatedMonthlySavings: 25,
      });

    }

  }

  return recommendations;

};