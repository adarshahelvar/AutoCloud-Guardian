import Recommendation from "../models/recommendation.model.js";

export const generateRecommendations = async (
  organizationId,
  cloudAccountId,
  scanResults,
) => {
  const recommendations = [];

  for (const resource of scanResults) {
    let recommendation = null;

    // Universal resourceId support
    const resourceId =
      resource.resourceId ||
      resource.instanceId ||
      resource.volumeId ||
      resource.allocationId ||
      resource.bucketName ||
      resource.dbIdentifier ||
      resource.loadBalancerArn ||
      resource.functionName ||
      null;

    if (!resourceId) continue;

    switch (resource.resourceType) {
      // ======================
      // EC2
      // ======================
      case "EC2":
        if (resource.state === "stopped") {
          recommendation = {
            organization: organizationId,
            cloudAccount: cloudAccountId,
            resourceId,
            resourceType: "EC2",
            severity: "HIGH",
            message: `EC2 Instance ${resourceId} is stopped but still incurring storage cost. Consider terminating it.`,
            estimatedMonthlySavings: 10,
          };
        }
        break;

      // ======================
      // EBS
      // ======================
      case "EBS":
        if (
          resource.attached === false ||
          resource.message?.includes("Unattached")
        ) {
          recommendation = {
            organization: organizationId,
            cloudAccount: cloudAccountId,
            resourceId,
            resourceType: "EBS",
            severity: "HIGH",
            message: `Unattached EBS Volume ${resourceId}. Consider deleting it.`,
            estimatedMonthlySavings: 5,
          };
        }
        break;

      // ======================
      // ELASTIC IP
      // ======================
      case "ELASTIC_IP":
        if (resource.associated === false) {
          recommendation = {
            organization: organizationId,
            cloudAccount: cloudAccountId,
            resourceId,
            resourceType: "ELASTIC_IP",
            severity: "HIGH",
            message: `Elastic IP ${resourceId} is not attached to any instance. Release it.`,
            estimatedMonthlySavings: 3,
          };
        }
        break;

      // ======================
      // S3
      // ======================
      case "S3":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId,
          resourceType: "S3",
          severity: "LOW",
          message: `Enable lifecycle rules on bucket ${resourceId} to move old objects to Glacier.`,
          estimatedMonthlySavings: 2,
        };
        break;

      // ======================
      // RDS
      // ======================
      case "RDS":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId,
          resourceType: "RDS",
          severity: "MEDIUM",
          message: `Review instance size for RDS ${resourceId}. Consider downsizing if underutilized.`,
          estimatedMonthlySavings: 15,
        };
        break;

      // ======================
      // LOAD BALANCER
      // ======================
      case "LOAD_BALANCER":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId,
          resourceType: "LOAD_BALANCER",
          severity: "MEDIUM",
          message: `Check if Load Balancer ${resourceId} is unused.`,
          estimatedMonthlySavings: 8,
        };
        break;

      // ======================
      // LAMBDA
      // ======================
      case "LAMBDA":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId,
          resourceType: "LAMBDA",
          severity: "LOW",
          message: `Review Lambda ${resourceId} usage. Remove unused functions.`,
          estimatedMonthlySavings: 1,
        };
        break;
    }

    // Push only valid recommendation
    if (recommendation) {
      recommendations.push(recommendation);
    }
  }

  if (recommendations.length > 0) {
    await Recommendation.insertMany(recommendations);
  }

  return recommendations;
};
