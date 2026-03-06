import { EC2Client, DescribeRegionsCommand } from "@aws-sdk/client-ec2";

import { optimizeEC2 } from "./optimizers/ec2.optimizer.js";
import { optimizeEBS } from "./optimizers/ebs.optimizer.js";
import { optimizeElasticIP } from "./optimizers/networking.optimizer.js";
import { optimizeECS } from "./optimizers/ecs.optimizer.js";
import { optimizeEKS } from "./optimizers/eks.optimizer.js";
import { optimizeRDS } from "./optimizers/rds.optimizer.js";
import { optimizeS3 } from "./optimizers/s3.optimizer.js";

/**
 * Get all AWS regions
 */
const getAllRegions = async (credentials) => {
  const client = new EC2Client({
    region: "us-east-1",
    credentials,
  });

  const command = new DescribeRegionsCommand({});
  const response = await client.send(command);

  return response.Regions.map((region) => region.RegionName);
};

/**
 * Scan all regions
 */
export const scanAllRegions = async (credentials) => {
  const allRecommendations = [];

  const regions = await getAllRegions(credentials);

  console.log("🌍 Regions Found:", regions.length);

  for (const region of regions) {
    console.log(`🔎 Scanning region: ${region}`);

    try {
      /* EC2 */
      const ec2 = await optimizeEC2(credentials, region);
      allRecommendations.push(...ec2);

      /* EBS */
      const ebs = await optimizeEBS(credentials, region);
      allRecommendations.push(...ebs);

      /* Elastic IP */
      const eip = await optimizeElasticIP(credentials, region);
      allRecommendations.push(...eip);

      /* ECS (suggestion only) */
      const ecs = await optimizeECS(credentials, region);
      allRecommendations.push(...ecs);

      /* EKS (suggestion only) */
      const eks = await optimizeEKS(credentials, region);
      allRecommendations.push(...eks);

      /* RDS (suggestion only) */
      const rds = await optimizeRDS(credentials, region);
      allRecommendations.push(...rds);
    } catch (error) {
      console.log(`⚠️ Failed region ${region}`, error.message);
    }
  }

  /* S3 is global */
  const s3 = await optimizeS3(credentials);
  allRecommendations.push(...s3);

  console.log(`✅ Total Recommendations: ${allRecommendations.length}`);

  return allRecommendations;
};