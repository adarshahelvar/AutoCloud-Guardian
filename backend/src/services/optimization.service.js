import Recommendation from "../models/recommendation.model.js";

// Optimizers
import { optimizeEC2 } from "./optimizers/ec2.optimizer.js";
import { optimizeECS } from "./optimizers/ecs.optimizer.js";
import { optimizeEKS } from "./optimizers/eks.optimizer.js";
import { optimizeEBS } from "./optimizers/ebs.optimizer.js";
import { optimizeElasticIP } from "./optimizers/networking.optimizer.js";
import { optimizeRDS } from "./optimizers/rds.optimizer.js";
import { optimizeS3 } from "./optimizers/s3.optimizer.js";

/**
 * -----------------------------------------------------
 * Run Full Optimization Engine
 * -----------------------------------------------------
 */
export const runOptimization = async (
  credentials,
  region,
  organizationId,
  cloudAccountId
) => {
  try {
    console.log("🚀 Starting Optimization Engine...");

    /* -------------------------------
       Validate Credentials
    --------------------------------*/
    if (
      !credentials ||
      !credentials.accessKeyId ||
      !credentials.secretAccessKey
    ) {
      throw new Error("Invalid AWS credentials received");
    }

    const allRecommendations = [];

    /* ================= EC2 ================= */
    console.log("🔍 Optimizing EC2...");
    const ec2Recs = await optimizeEC2(credentials, region);
    if (ec2Recs?.length) allRecommendations.push(...ec2Recs);

    /* ================= ECS ================= */
    console.log("🔍 Optimizing ECS...");
    const ecsRecs = await optimizeECS(credentials, region);
    if (ecsRecs?.length) allRecommendations.push(...ecsRecs);

    /* ================= EKS ================= */
    console.log("🔍 Optimizing EKS...");
    const eksRecs = await optimizeEKS(credentials, region);
    if (eksRecs?.length) allRecommendations.push(...eksRecs);

    /* ================= EBS ================= */
    console.log("🔍 Optimizing EBS...");
    const ebsRecs = await optimizeEBS(credentials, region);
    if (ebsRecs?.length) allRecommendations.push(...ebsRecs);

    /* ================= Elastic IP ================= */
    console.log("🔍 Optimizing Elastic IP...");
    const eipRecs = await optimizeElasticIP(credentials, region);
    if (eipRecs?.length) allRecommendations.push(...eipRecs);

    /* ================= RDS ================= */
    console.log("🔍 Optimizing RDS...");
    const rdsRecs = await optimizeRDS(credentials, region);
    if (rdsRecs?.length) allRecommendations.push(...rdsRecs);

    /* ================= S3 ================= */
    console.log("🔍 Optimizing S3...");
    const s3Recs = await optimizeS3(credentials, region);
    if (s3Recs?.length) allRecommendations.push(...s3Recs);

    console.log(`✅ Total Recommendations Found: ${allRecommendations.length}`);

    /* ------------------------------------------------
       Save Recommendations To Database
    ------------------------------------------------ */

    let savedCount = 0;

    for (const rec of allRecommendations) {
      await Recommendation.findOneAndUpdate(
        {
          resourceId: rec.resourceId,
          cloudAccount: cloudAccountId,
        },
        {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId: rec.resourceId,
          resourceType: rec.resourceType,
          severity: rec.severity,
          message: rec.message,
          estimatedMonthlySavings: rec.estimatedMonthlySavings || 0,
          status: "OPEN",
        },
        {
          upsert: true,
          new: true,
        }
      );

      savedCount++;
    }

    return {
      success: true,
      totalRecommendations: savedCount,
      message: "Optimization analysis completed",
    };
  } catch (error) {
    console.error("❌ Optimization Engine Failed:", error);
    throw error;
  }
};