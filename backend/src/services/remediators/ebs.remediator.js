import {
  EC2Client,
  DeleteVolumeCommand
} from "@aws-sdk/client-ec2";

export const deleteEBSVolume = async (credentials, region, volumeId) => {

  const client = new EC2Client({
    region,
    credentials
  });

  const command = new DeleteVolumeCommand({
    VolumeId: volumeId
  });

  await client.send(command);

  console.log(`🗑 EBS deleted: ${volumeId}`);
};