import {
  EC2Client,
  DescribeAddressesCommand,
} from "@aws-sdk/client-ec2";

export const optimizeElasticIP = async (credentials, region) => {
  const ec2Client = new EC2Client({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  const recommendations = [];

  const addresses = await ec2Client.send(
    new DescribeAddressesCommand({})
  );

  for (const addr of addresses.Addresses || []) {
    const isAssociated =
      !!addr.AssociationId ||
      !!addr.InstanceId ||
      !!addr.NetworkInterfaceId;

    if (!isAssociated) {
      recommendations.push({
        resourceId: addr.AllocationId,
        resourceType: "ELASTIC_IP",
        region,
        associated: false,
        severity: "HIGH",
        message: "Unused Elastic IP detected",
        estimatedMonthlySavings: 3,
      });
    }
  }

  console.log(`Elastic IP recommendations in ${region}:`, recommendations);

  return recommendations;
};