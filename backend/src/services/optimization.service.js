import ResourceInventory from "../models/resourceInventory.model.js";
import Recommendation from "../models/recommendation.model.js";

export const runOptimization = async (orgId, cloudAccountId) => {
  /* =============================
     1️⃣ Idle EC2 Detection
  ============================== */

  const ec2Instances = await ResourceInventory.find({
    organization: orgId,
    cloudAccount: cloudAccountId,
    resourceType: "EC2",
  });

  for (const instance of ec2Instances) {
    if (instance.metadata?.state === "running") {
      // Simple rule (expand later with CloudWatch metrics)
      if (instance.metadata?.instanceType === "t2.micro") {
        await Recommendation.findOneAndUpdate(
          {
            resourceId: instance.resourceId,
            cloudAccount: cloudAccountId,
          },
          {
            organization: orgId,
            cloudAccount: cloudAccountId,
            resourceId: instance.resourceId,
            resourceType: "EC2",
            severity: "MEDIUM",
            message: "Instance may be underutilized. Consider resizing.",
            estimatedMonthlySavings: 10,
          },
          { upsert: true },
        );
      }
    }
  }

  /* =============================
     2️⃣ Unattached EBS Detection
  ============================== */

  const volumes = await ResourceInventory.find({
    organization: orgId,
    cloudAccount: cloudAccountId,
    resourceType: "EBS",
  });

  for (const volume of volumes) {
    if (!volume.metadata?.attachments?.length) {
      await Recommendation.findOneAndUpdate(
        {
          resourceId: volume.resourceId,
          cloudAccount: cloudAccountId,
        },
        {
          organization: orgId,
          cloudAccount: cloudAccountId,
          resourceId: volume.resourceId,
          resourceType: "EBS",
          severity: "HIGH",
          message: "Unattached volume detected. Delete to save cost.",
          estimatedMonthlySavings: 5,
        },
        { upsert: true },
      );
    }
  }

  return {
    message: "Optimization analysis completed",
  };
};
