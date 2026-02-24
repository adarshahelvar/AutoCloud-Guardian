import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

export const scanEC2 = async (region, credentials) => {
  const client = new EC2Client({
    region,
    credentials,
  });

  const data = await client.send(new DescribeInstancesCommand({}));

  const instances = [];

  data.Reservations?.forEach((reservation) => {
    reservation.Instances.forEach((instance) => {
      instances.push({
        resourceType: "EC2",
        resourceId: instance.InstanceId,
        region,
        metadata: instance,
      });
    });
  });

  return instances;
};