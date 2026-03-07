import {
  EC2Client,
  StopInstancesCommand,
  TerminateInstancesCommand,
} from "@aws-sdk/client-ec2";

export const stopEC2Instance = async (credentials, region, instanceId) => {
  const client = new EC2Client({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  const command = new StopInstancesCommand({
    InstanceIds: [instanceId],
  });

  await client.send(command);

  console.log(`🛑 EC2 stopped: ${instanceId}`);
};

export const terminateEC2Instance = async (credentials, region, instanceId) => {
  const client = new EC2Client({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  const command = new TerminateInstancesCommand({
    InstanceIds: [instanceId],
  });

  await client.send(command);

  console.log(`💥 EC2 terminated: ${instanceId}`);
};