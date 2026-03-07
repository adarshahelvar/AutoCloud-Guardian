import {
  EC2Client,
  DescribeNatGatewaysCommand,
} from "@aws-sdk/client-ec2";

export const optimizeNatGateway = async (credentials, region) => {
  const client = new EC2Client({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  const recommendations = [];

  const response = await client.send(
    new DescribeNatGatewaysCommand({})
  );

  for (const nat of response.NatGateways || []) {
    if (nat.State === "available") {
      recommendations.push({
        resourceId: nat.NatGatewayId,
        resourceType: "NAT_GATEWAY",
        region,
        severity: "MEDIUM",
        message: `NAT Gateway ${nat.NatGatewayId} may be contributing unnecessary cost.`,
        estimatedMonthlySavings: 10,
      });
    }
  }

  console.log(`NAT Gateway recommendations in ${region}:`, recommendations);

  return recommendations;
};