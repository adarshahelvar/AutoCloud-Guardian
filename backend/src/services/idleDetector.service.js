import {
  CloudWatchClient,
  GetMetricStatisticsCommand,
} from "@aws-sdk/client-cloudwatch";

import ResourceInventory from "../models/resourceInventory.model.js";

export const detectIdleEC2 = async (
  credentials,
  region,
  organizationId,
  cloudAccountId
) => {
  const cloudwatch = new CloudWatchClient({
    region,
    credentials,
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const now = new Date();

  const ec2Instances = await ResourceInventory.find({
    organization: organizationId,
    cloudAccount: cloudAccountId,
    resourceType: "EC2",
  });

  const idleInstances = [];

  for (const instance of ec2Instances) {
    const command = new GetMetricStatisticsCommand({
      Namespace: "AWS/EC2",
      MetricName: "CPUUtilization",
      Dimensions: [
        {
          Name: "InstanceId",
          Value: instance.resourceId,
        },
      ],
      StartTime: sevenDaysAgo,
      EndTime: now,
      Period: 86400, // 1 day
      Statistics: ["Average"],
    });

    const data = await cloudwatch.send(command);

    const datapoints = data.Datapoints || [];

    if (datapoints.length === 0) continue;

    const avgCpu =
      datapoints.reduce((sum, point) => sum + point.Average, 0) /
      datapoints.length;

    if (avgCpu < 5) {
      idleInstances.push({
        instanceId: instance.resourceId,
        averageCpu: avgCpu,
        recommendation: "Consider stopping or resizing this instance",
      });
    }
  }

  return idleInstances;
};