import {
  EC2Client,
  StopInstancesCommand
} from "@aws-sdk/client-ec2";

export const stopEC2Instance = async (credentials, region, instanceId) => {

  const client = new EC2Client({
    region,
    credentials
  });

  const command = new StopInstancesCommand({
    InstanceIds: [instanceId]
  });

  await client.send(command);

  console.log(`🛑 EC2 stopped: ${instanceId}`);
};