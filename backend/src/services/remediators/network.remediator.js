import {
  EC2Client,
  ReleaseAddressCommand
} from "@aws-sdk/client-ec2";

export const releaseElasticIP = async (credentials, region, allocationId) => {

  const client = new EC2Client({
    region,
    credentials
  });

  const command = new ReleaseAddressCommand({
    AllocationId: allocationId
  });

  await client.send(command);

  console.log(`🌐 Elastic IP released: ${allocationId}`);
};