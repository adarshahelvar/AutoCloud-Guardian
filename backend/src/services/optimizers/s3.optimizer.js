import {
  S3Client,
  ListBucketsCommand,
  GetBucketLifecycleConfigurationCommand,
} from "@aws-sdk/client-s3";

export const optimizeS3 = async (credentials, region) => {
  const s3Client = new S3Client({ region, credentials });
  const recommendations = [];

  const buckets = await s3Client.send(
    new ListBucketsCommand({})
  );

  for (const bucket of buckets.Buckets || []) {
    try {
      await s3Client.send(
        new GetBucketLifecycleConfigurationCommand({
          Bucket: bucket.Name,
        })
      );
    } catch {
      recommendations.push({
        resourceId: bucket.Name,
        resourceType: "S3",
        severity: "LOW",
        message:
          "S3 bucket without lifecycle policy. Consider adding lifecycle rules.",
        estimatedMonthlySavings: 2,
      });
    }
  }

  return recommendations;
};