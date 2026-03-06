import Recommendation from "../models/recommendation.model.js";

export const generateRecommendations = async (
  organizationId,
  cloudAccountId,
  scanResults
) => {
  const recommendations = [];

  for (const resource of scanResults) {

    let recommendation = null;

    switch (resource.resourceType) {

      // ======================
      // EC2
      // ======================
      case "EC2":
        if (resource.state === "stopped") {
          recommendation = {
            organization: organizationId,
            cloudAccount: cloudAccountId,
            resourceId: resource.instanceId,
            resourceType: "EC2",
            severity: "HIGH",
            message: `EC2 Instance ${resource.instanceId} is stopped but still incurring storage cost. Consider terminating it.`,
            estimatedMonthlySavings: 10
          };
        }
        break;

      // ======================
      // EBS
      // ======================
      case "EBS":
        if (!resource.attached) {
          recommendation = {
            organization: organizationId,
            cloudAccount: cloudAccountId,
            resourceId: resource.volumeId,
            resourceType: "EBS",
            severity: "HIGH",
            message: `Unattached EBS Volume ${resource.volumeId}. Consider deleting it.`,
            estimatedMonthlySavings: 5
          };
        }
        break;

      // ======================
      // ELASTIC IP
      // ======================
      case "ELASTIC_IP":
        if (!resource.associated) {
          recommendation = {
            organization: organizationId,
            cloudAccount: cloudAccountId,
            resourceId: resource.allocationId,
            resourceType: "ELASTIC_IP",
            severity: "HIGH",
            message: `Elastic IP ${resource.allocationId} is not attached to any instance. Release it.`,
            estimatedMonthlySavings: 3
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
          resourceId: resource.bucketName,
          resourceType: "S3",
          severity: "LOW",
          message: `Enable lifecycle rules on bucket ${resource.bucketName} to move old objects to Glacier.`,
          estimatedMonthlySavings: 2
        };
        break;

      // ======================
      // RDS
      // ======================
      case "RDS":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId: resource.dbIdentifier,
          resourceType: "RDS",
          severity: "MEDIUM",
          message: `Review instance size for RDS ${resource.dbIdentifier}. Consider downsizing if underutilized.`,
          estimatedMonthlySavings: 15
        };
        break;

      // ======================
      // LOAD BALANCER
      // ======================
      case "LOAD_BALANCER":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId: resource.loadBalancerArn,
          resourceType: "LOAD_BALANCER",
          severity: "MEDIUM",
          message: `Check if Load Balancer ${resource.loadBalancerArn} is unused.`,
          estimatedMonthlySavings: 8
        };
        break;

      // ======================
      // LAMBDA
      // ======================
      case "LAMBDA":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId: resource.functionName,
          resourceType: "LAMBDA",
          severity: "LOW",
          message: `Review Lambda ${resource.functionName} usage. Remove unused functions.`,
          estimatedMonthlySavings: 1
        };
        break;
    }

    if (recommendation) {
      recommendations.push(recommendation);
    }
  }

  if (recommendations.length > 0) {
    await Recommendation.insertMany(recommendations);
  }

  return recommendations;
};