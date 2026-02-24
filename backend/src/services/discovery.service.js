// import CloudAccount from "../models/cloudAccount.model.js";
// import ResourceInventory from "../models/resourceInventory.model.js";
// import { assumeCustomerRole } from "../utils/awsClient.js";
// import { scanEC2 } from "./ec2.scanner.js";

// export const runDiscovery = async (cloudAccountId) => {
//   const cloudAccount = await CloudAccount.findById(cloudAccountId);

//   const credentials = await assumeCustomerRole(
//     cloudAccount.roleArn,
//     cloudAccount.externalId,
//     cloudAccount.region,
//   );

//   // 1️⃣ Scan EC2
//   const ec2Resources = await scanEC2(cloudAccount.region, credentials);

//   // 2️⃣ Clear old inventory
//   await ResourceInventory.deleteMany({
//     cloudAccount: cloudAccount._id,
//   });

//   // 3️⃣ Save new inventory
//   await ResourceInventory.insertMany(
//     ec2Resources.map((r) => ({
//       ...r,
//       organization: cloudAccount.organization,
//       cloudAccount: cloudAccount._id,
//     })),
//   );

//   return {
//     success: true,
//     total: ec2Resources.length,
//   };
// };


import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { RDSClient, DescribeDBInstancesCommand } from "@aws-sdk/client-rds";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

export const runDiscovery = async (credentials, region) => {
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

  let ec2Count = 0;
  ec2Data.Reservations?.forEach((reservation) => {
    ec2Count += reservation.Instances?.length || 0;
  });

  results.ec2 = ec2Count;

  /* ------------------ RDS ------------------ */
  const rdsClient = new RDSClient({
    region,
    credentials,
  });

  const rdsData = await rdsClient.send(
    new DescribeDBInstancesCommand({})
  );

  results.rds = rdsData.DBInstances?.length || 0;

  /* ------------------ S3 ------------------ */
  const s3Client = new S3Client({
    region,
    credentials,
  });

  const s3Data = await s3Client.send(
    new ListBucketsCommand({})
  );

  results.s3 = s3Data.Buckets?.length || 0;

  return results;
};