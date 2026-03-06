import Recommendation from "../models/recommendation.model.js";

import { stopEC2Instance } from "./remediators/ec2.remediator.js";
import { deleteEBSVolume } from "./remediators/ebs.remediator.js";
import { releaseElasticIP } from "./remediators/network.remediator.js";

export const runAutoRemediation = async (credentials, region) => {
  try {
    console.log("🚀 Starting Auto Remediation Engine...");

    const openRecs = await Recommendation.find({ status: "OPEN" });

    let fixed = 0;

    for (const rec of openRecs) {
      try {

        switch (rec.resourceType) {

          case "EC2_INSTANCE":
            await stopEC2Instance(credentials, region, rec.resourceId);
            break;

          case "EBS_VOLUME":
            await deleteEBSVolume(credentials, region, rec.resourceId);
            break;

          case "ELASTIC_IP":
            await releaseElasticIP(credentials, region, rec.resourceId);
            break;

          default:
            continue;
        }

        rec.status = "RESOLVED";
        await rec.save();

        fixed++;

      } catch (error) {
        console.log("Remediation failed:", error.message);
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