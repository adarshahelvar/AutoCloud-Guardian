import {
  EC2Client,
  DescribeVolumesCommand,
} from "@aws-sdk/client-ec2";
import ResourceInventory from "../../models/resourceInventory.model.js";

export const scanEBS = async (credentials, region, orgId, accountId) => {
  const client = new EC2Client({ region, credentials });
  const data = await client.send(new DescribeVolumesCommand({}));

  let count = 0;

  for (const volume of data.Volumes || []) {
    count++;

    await ResourceInventory.findOneAndUpdate(
      { resourceId: volume.VolumeId, cloudAccount: accountId },
      {
        organization: orgId,
        cloudAccount: accountId,
        resourceType: "EBS",
        resourceId: volume.VolumeId,
        region,
        metadata: {
          size: volume.Size,
          state: volume.State,
          volumeType: volume.VolumeType,
          attachedTo: volume.Attachments?.[0]?.InstanceId || null,
        },
      },
      { upsert: true }
    );
  }

  return count;
};