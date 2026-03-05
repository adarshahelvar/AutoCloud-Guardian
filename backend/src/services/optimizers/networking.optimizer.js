import {
  EC2Client,
  DescribeAddressesCommand,
} from "@aws-sdk/client-ec2";

export const optimizeElasticIP = async (credentials, region) => {
  const ec2Client = new EC2Client({ region, credentials });
  const recommendations = [];

  const addresses = await ec2Client.send(
    new DescribeAddressesCommand({})
  );

  for (const addr of addresses.Addresses || []) {
    if (!addr.InstanceId) {
      recommendations.push({
        resourceId: addr.PublicIp,
        resourceType: "ElasticIP",
        severity: "MEDIUM",
        message: "Unattached Elastic IP detected",
        estimatedMonthlySavings: 3,
      });
    }
  }

  return recommendations;
};