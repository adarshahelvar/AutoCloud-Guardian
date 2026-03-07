import Recommendation from "../models/recommendation.model.js";

import { stopEC2Instance } from "./remediators/ec2.remediator.js";
import { deleteEBSVolume } from "./remediators/ebs.remediator.js";
import { releaseElasticIP } from "./remediators/network.remediator.js";

export const runAutoRemediation = async (credentials, region, cloudAccountId) => {
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
        switch (rec.resourceType) {
          case "EC2":
            if (rec.action === "STOP" || rec.action === "TERMINATE") {
              await stopEC2Instance(credentials, region, rec.resourceId);
            }
            break;

          case "EBS":
            if (rec.action === "DELETE") {
              await deleteEBSVolume(credentials, region, rec.resourceId);
            }
            break;

          case "ELASTIC_IP":
            if (rec.action === "RELEASE") {
              await releaseElasticIP(credentials, region, rec.resourceId);
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