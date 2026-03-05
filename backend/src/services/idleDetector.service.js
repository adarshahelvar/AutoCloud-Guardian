import {
  EC2Client,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";

import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from "@aws-sdk/client-cloudwatch";

export const detectIdleEC2 = async (credentials, region) => {
  const ec2Client = new EC2Client({ region, credentials });
  const cwClient = new CloudWatchClient({ region, credentials });

  const idleInstances = [];

  const ec2Data = await ec2Client.send(
    new DescribeInstancesCommand({})
  );

  for (const reservation of ec2Data.Reservations || []) {
    for (const instance of reservation.Instances || []) {
      if (instance.State.Name !== "running") continue;

      const endTime = new Date();
      const startTime = new Date();
      startTime.setDate(endTime.getDate() - 7);

      const metricParams = {
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
        Period: 86400, // 1 day
        Statistics: ["Average"],
      };

      const metrics = await cwClient.send(
        new GetMetricStatisticsCommand(metricParams)
      );

      const datapoints = metrics.Datapoints || [];

      if (datapoints.length === 0) continue;

      const totalCpu = datapoints.reduce(
        (sum, point) => sum + point.Average,
        0
      );

      const avgCpu = totalCpu / datapoints.length;

      if (avgCpu < 5) {
        idleInstances.push({
          instanceId: instance.InstanceId,
          averageCpu: avgCpu,
          recommendation:
            "Instance idle for 7 days. Consider stopping to save cost.",
        });
      }
    }
  }

  return idleInstances;
};