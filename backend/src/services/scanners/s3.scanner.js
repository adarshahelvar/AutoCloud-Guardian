import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import ResourceInventory from "../../models/resourceInventory.model.js";

export const scanS3 = async (credentials, region, orgId, accountId) => {
  const client = new S3Client({ region, credentials });
  const data = await client.send(new ListBucketsCommand({}));

  let count = 0;

  for (const bucket of data.Buckets || []) {
    count++;

    await ResourceInventory.findOneAndUpdate(
      { resourceId: bucket.Name, cloudAccount: accountId },
      {
        organization: orgId,
        cloudAccount: accountId,
        resourceType: "S3",
        resourceId: bucket.Name,
        region,
        metadata: {
          createdAt: bucket.CreationDate,
        },
      },
      { upsert: true },
    );
  }

  return count;
};
