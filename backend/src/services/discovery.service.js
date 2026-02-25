
// import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
// import { RDSClient, DescribeDBInstancesCommand } from "@aws-sdk/client-rds";
// import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
// import ResourceInventory from "../models/resourceInventory.model.js";

// export const runDiscovery = async (credentials, region) => {
//   const results = {
//     ec2: 0,
//     rds: 0,
//     s3: 0,
//   };

//   /* ------------------ EC2 ------------------ */
//   const ec2Client = new EC2Client({
//     region,
//     credentials,
//   });

//   const ec2Data = await ec2Client.send(
//     new DescribeInstancesCommand({})
//   );

//   let ec2Count = 0;
//   ec2Data.Reservations?.forEach((reservation) => {
//     ec2Count += reservation.Instances?.length || 0;
//   });

//   results.ec2 = ec2Count;

//   /* ------------------ RDS ------------------ */
//   const rdsClient = new RDSClient({
//     region,
//     credentials,
//   });

//   const rdsData = await rdsClient.send(
//     new DescribeDBInstancesCommand({})
//   );

//   results.rds = rdsData.DBInstances?.length || 0;

//   /* ------------------ S3 ------------------ */
//   const s3Client = new S3Client({
//     region,
//     credentials,
//   });

//   const s3Data = await s3Client.send(
//     new ListBucketsCommand({})
//   );

//   results.s3 = s3Data.Buckets?.length || 0;

//   return results;
// };

import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { RDSClient, DescribeDBInstancesCommand } from "@aws-sdk/client-rds";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import ResourceInventory from "../models/resourceInventory.model.js";

export const runDiscovery = async (
  credentials,
  region,
  organizationId,
  cloudAccountId
) => {
  const results = {
    ec2: 0,
    rds: 0,
    s3: 0,
  };

  /* ------------------ EC2 ------------------ */
  const ec2Client = new EC2Client({
    region,
    credentials,
  });

  const ec2Data = await ec2Client.send(
    new DescribeInstancesCommand({})
  );

  for (const reservation of ec2Data.Reservations || []) {
    for (const instance of reservation.Instances || []) {
      results.ec2++;

      await ResourceInventory.findOneAndUpdate(
        {
          resourceId: instance.InstanceId,
          cloudAccount: cloudAccountId,
        },
        {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceType: "EC2",
          resourceId: instance.InstanceId,
          region,
          metadata: {
            instanceType: instance.InstanceType,
            state: instance.State?.Name,
            launchTime: instance.LaunchTime,
          },
          lastScannedAt: new Date(),
        },
        { upsert: true }
      );
    }
  }

  /* ------------------ RDS ------------------ */
  const rdsClient = new RDSClient({
    region,
    credentials,
  });

  const rdsData = await rdsClient.send(
    new DescribeDBInstancesCommand({})
  );

  for (const db of rdsData.DBInstances || []) {
    results.rds++;

    await ResourceInventory.findOneAndUpdate(
      {
        resourceId: db.DBInstanceIdentifier,
        cloudAccount: cloudAccountId,
      },
      {
        organization: organizationId,
        cloudAccount: cloudAccountId,
        resourceType: "RDS",
        resourceId: db.DBInstanceIdentifier,
        region,
        metadata: {
          engine: db.Engine,
          status: db.DBInstanceStatus,
          instanceClass: db.DBInstanceClass,
        },
        lastScannedAt: new Date(),
      },
      { upsert: true }
    );
  }

  /* ------------------ S3 ------------------ */
  const s3Client = new S3Client({
    region,
    credentials,
  });

  const s3Data = await s3Client.send(
    new ListBucketsCommand({})
  );

  for (const bucket of s3Data.Buckets || []) {
    results.s3++;

    await ResourceInventory.findOneAndUpdate(
      {
        resourceId: bucket.Name,
        cloudAccount: cloudAccountId,
      },
      {
        organization: organizationId,
        cloudAccount: cloudAccountId,
        resourceType: "S3",
        resourceId: bucket.Name,
        region,
        metadata: {
          creationDate: bucket.CreationDate,
        },
        lastScannedAt: new Date(),
      },
      { upsert: true }
    );
  }

  return results;
};