import {
  EC2Client,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";

import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from "@aws-sdk/client-cloudwatch";

export const optimizeEC2 = async (credentials, region) => {
  const ec2Client = new EC2Client({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  const cwClient = new CloudWatchClient({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

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
      const state = instance.State?.Name;

      // 1️⃣ Stopped instances → direct recommendation
      if (state === "stopped") {
        recommendations.push({
          resourceId: instance.InstanceId,
          resourceType: "EC2",
          state: "stopped",
          severity: "HIGH",
          message: `Stopped EC2 instance ${instance.InstanceId}. Consider terminating it if not needed.`,
          estimatedMonthlySavings: 10,
        });
        continue;
      }

      // 2️⃣ Only running instances go for CPU analysis
      if (state !== "running") continue;

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
          .catch((error) => {
            console.error(
              `CloudWatch metrics failed for ${instance.InstanceId} in ${region}:`,
              error.message
            );
            return null;
          })
      );
    }
  }

  const results = await Promise.all(metricPromises);

  for (const result of results) {
    if (!result) continue;

    const datapoints = result.metrics.Datapoints || [];
    if (!datapoints.length) continue;

    const avgCpu =
      datapoints.reduce((sum, p) => sum + p.Average, 0) /
      datapoints.length;

    if (avgCpu < 5) {
      recommendations.push({
        resourceId: result.instance.InstanceId,
        resourceType: "EC2",
        state: "running",
        severity: "HIGH",
        message: `EC2 instance ${result.instance.InstanceId} has <5% CPU utilization for 7 days.`,
        recommendation:
          avgCpu < 2 ? "Stop instance" : "Consider resizing instance",
        estimatedMonthlySavings: 25,
      });
    }
  }

  console.log(`EC2 recommendations in ${region}:`, recommendations);

  return recommendations;
};