import {
  EC2Client,
  DescribeVolumesCommand,
} from "@aws-sdk/client-ec2";

export const optimizeEBS = async (credentials, region) => {
  const ec2Client = new EC2Client({ region, credentials });
  const recommendations = [];

  const volumes = await ec2Client.send(
    new DescribeVolumesCommand({})
  );

  for (const volume of volumes.Volumes || []) {
    if (!volume.Attachments || volume.Attachments.length === 0) {
      recommendations.push({
        resourceId: volume.VolumeId,
        resourceType: "EBS",
        severity: "HIGH",
        message: "Unattached EBS volume detected",
        estimatedMonthlySavings: 5,
      });
    }
  }

  return recommendations;
};