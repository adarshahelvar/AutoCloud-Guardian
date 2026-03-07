import Recommendation from "../models/recommendation.model.js";

import {
  stopEC2Instance,
  terminateEC2Instance,
} from "./remediators/ec2.remediator.js";
import { deleteEBSVolume } from "./remediators/ebs.remediator.js";
import { releaseElasticIP } from "./remediators/network.remediator.js";

export const runAutoRemediation = async (
  credentials,
  defaultRegion,
  cloudAccountId
) => {
  try {
    console.log("🚀 Starting Auto Remediation Engine...");

    const openRecs = await Recommendation.find({
      cloudAccount: cloudAccountId,
      status: "OPEN",
      category: "ACTIONABLE",
    });

    let fixed = 0;

    for (const rec of openRecs) {
      try {
        const targetRegion = rec.region || defaultRegion;

        switch (rec.resourceType) {
          case "EC2":
            if (rec.action === "STOP") {
              await stopEC2Instance(credentials, targetRegion, rec.resourceId);
            } else if (rec.action === "TERMINATE") {
              await terminateEC2Instance(
                credentials,
                targetRegion,
                rec.resourceId
              );
            } else {
              continue;
            }
            break;

          case "EBS":
            if (rec.action === "DELETE") {
              await deleteEBSVolume(credentials, targetRegion, rec.resourceId);
            } else {
              continue;
            }
            break;

          case "ELASTIC_IP":
            if (rec.action === "RELEASE") {
              await releaseElasticIP(credentials, targetRegion, rec.resourceId);
            } else {
              continue;
            }
            break;

          default:
            continue;
        }

        rec.status = "RESOLVED";
        await rec.save();
        fixed++;
      } catch (error) {
        console.log(
          `Remediation failed for ${rec.resourceType} ${rec.resourceId}:`,
          error.message
        );
      }
    }

    return {
      success: true,
      fixed,
      message: "Auto remediation completed",
    };
  } catch (error) {
    console.error("Remediation Engine Failed:", error);
    throw error;
  }
};

export const fixSingleRecommendation = async (
  credentials,
  defaultRegion,
  recommendationId,
  cloudAccountId
) => {
  const rec = await Recommendation.findOne({
    _id: recommendationId,
    cloudAccount: cloudAccountId,
    status: "OPEN",
  });

  if (!rec) {
    throw new Error("Open recommendation not found");
  }

  if (rec.category !== "ACTIONABLE") {
    throw new Error(
      "This recommendation is advisory only. No auto action is available."
    );
  }

  const targetRegion = rec.region || defaultRegion;

  switch (rec.resourceType) {
    case "EC2":
      if (rec.action === "STOP") {
        await stopEC2Instance(credentials, targetRegion, rec.resourceId);
      } else if (rec.action === "TERMINATE") {
        await terminateEC2Instance(credentials, targetRegion, rec.resourceId);
      } else {
        throw new Error("Unsupported EC2 action");
      }
      break;

    case "EBS":
      if (rec.action === "DELETE") {
        await deleteEBSVolume(credentials, targetRegion, rec.resourceId);
      } else {
        throw new Error("Unsupported EBS action");
      }
      break;

    case "ELASTIC_IP":
      if (rec.action === "RELEASE") {
        await releaseElasticIP(credentials, targetRegion, rec.resourceId);
      } else {
        throw new Error("Unsupported Elastic IP action");
      }
      break;

    default:
      throw new Error("No auto-remediation available for this resource type");
  }

  rec.status = "RESOLVED";
  await rec.save();

  return {
    success: true,
    message: "Recommendation fixed successfully",
    data: rec,
  };
};