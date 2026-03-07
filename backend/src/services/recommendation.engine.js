import Recommendation from "../models/recommendation.model.js";

export const generateRecommendations = async (
  organizationId,
  cloudAccountId,
  scanResults,
) => {
  const recommendations = [];

  for (const resource of scanResults) {
    let recommendation = null;

    const resourceId =
      resource.resourceId ||
      resource.instanceId ||
      resource.volumeId ||
      resource.allocationId ||
      resource.bucketName ||
      resource.dbIdentifier ||
      resource.loadBalancerArn ||
      resource.functionName ||
      resource.clusterArn ||
      resource.nodegroupName ||
      resource.natGatewayId ||
      null;

    const region = resource.region || null;

    if (!resourceId) continue;

    switch (resource.resourceType) {
      case "EC2":
        if (
          resource.state === "stopped" ||
          resource.message?.includes("Stopped EC2")
        ) {
          recommendation = {
            organization: organizationId,
            cloudAccount: cloudAccountId,
            resourceId,
            resourceType: "EC2",
            region,
            severity: "HIGH",
            category: "ACTIONABLE",
            action: "TERMINATE",
            message: `Stopped EC2 instance ${resourceId} detected.`,
            remediation:
              "Terminate this instance if it is no longer needed. If required occasionally, keep it stopped.",
            estimatedMonthlySavings: 10,
            status: "OPEN",
          };
        } else if (
          resource.message?.includes("<5% CPU") ||
          resource.message?.includes("CPU utilization")
        ) {
          recommendation = {
            organization: organizationId,
            cloudAccount: cloudAccountId,
            resourceId,
            resourceType: "EC2",
            region,
            severity: "HIGH",
            category: "ACTIONABLE",
            action: "STOP",
            message: resource.message,
            remediation:
              "Stop this instance if idle, or resize it if it is still needed.",
            estimatedMonthlySavings: resource.estimatedMonthlySavings || 25,
            status: "OPEN",
          };
        }
        break;

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
            region,
            severity: "HIGH",
            category: "ACTIONABLE",
            action: "DELETE",
            message: `Unattached EBS Volume ${resourceId} detected.`,
            remediation:
              "Delete this volume if it is no longer needed. Take a snapshot first if backup is needed.",
            estimatedMonthlySavings: 5,
            status: "OPEN",
          };
        }
        break;

      case "ELASTIC_IP":
        if (
          resource.associated === false ||
          resource.message?.includes("Unused")
        ) {
          recommendation = {
            organization: organizationId,
            cloudAccount: cloudAccountId,
            resourceId,
            resourceType: "ELASTIC_IP",
            region,
            severity: "HIGH",
            category: "ACTIONABLE",
            action: "RELEASE",
            message: `Unused Elastic IP ${resourceId} detected.`,
            remediation:
              "Release this Elastic IP if it is not reserved for future use.",
            estimatedMonthlySavings: 3,
            status: "OPEN",
          };
        }
        break;

      case "RDS":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId,
          resourceType: "RDS",
          region,
          severity: "MEDIUM",
          category: "ADVISORY",
          action: "REVIEW",
          message: `RDS instance ${resourceId} may be underutilized.`,
          remediation:
            "Review CPU, memory, and connections. Consider downsizing, off-hour shutdown for non-production DBs, or reserved instances.",
          estimatedMonthlySavings: 15,
          status: "OPEN",
        };
        break;

      case "S3":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId,
          resourceType: "S3",
          region,
          severity: "LOW",
          category: "ADVISORY",
          action: "OPTIMIZE",
          message: `S3 bucket ${resourceId} can be optimized for lower storage cost.`,
          remediation:
            "Enable lifecycle rules, transition old objects to Glacier or Infrequent Access, and remove unused data.",
          estimatedMonthlySavings: 2,
          status: "OPEN",
        };
        break;

      case "ECS":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId,
          resourceType: "ECS",
          region,
          severity: "MEDIUM",
          category: "ADVISORY",
          action: "REVIEW",
          message: `ECS resource ${resourceId} may be over-provisioned.`,
          remediation:
            "Review desired task count, CPU/memory allocation, and service utilization before reducing capacity.",
          estimatedMonthlySavings: 8,
          status: "OPEN",
        };
        break;

      case "EKS":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId,
          resourceType: "EKS",
          region,
          severity: "MEDIUM",
          category: "ADVISORY",
          action: "REVIEW",
          message: `EKS resource ${resourceId} may be underutilized.`,
          remediation:
            "Review cluster usage, node group size, and autoscaling before changing capacity.",
          estimatedMonthlySavings: 12,
          status: "OPEN",
        };
        break;

      case "LOAD_BALANCER":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId,
          resourceType: "LOAD_BALANCER",
          region,
          severity: "MEDIUM",
          category: "ADVISORY",
          action: "REVIEW",
          message: `Load Balancer ${resourceId} may be low-utilization or unused.`,
          remediation:
            "Review traffic, target groups, and attached services before removing or consolidating this load balancer.",
          estimatedMonthlySavings: 8,
          status: "OPEN",
        };
        break;

      case "NAT_GATEWAY":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId,
          resourceType: "NAT_GATEWAY",
          region,
          severity: "MEDIUM",
          category: "ADVISORY",
          action: "OPTIMIZE",
          message: `NAT Gateway ${resourceId} may be contributing unnecessary cost.`,
          remediation:
            "Review traffic patterns, consolidate NAT gateways where possible, or redesign outbound routing.",
          estimatedMonthlySavings: 10,
          status: "OPEN",
        };
        break;

      case "LAMBDA":
        recommendation = {
          organization: organizationId,
          cloudAccount: cloudAccountId,
          resourceId,
          resourceType: "LAMBDA",
          region,
          severity: "LOW",
          category: "ADVISORY",
          action: "REVIEW",
          message: `Lambda function ${resourceId} should be reviewed for optimization.`,
          remediation:
            "Review invocation count, duration, memory settings, and remove unused functions or versions.",
          estimatedMonthlySavings: 1,
          status: "OPEN",
        };
        break;
    }

    if (!recommendation) continue;

    const savedRecommendation = await Recommendation.findOneAndUpdate(
      {
        organization: organizationId,
        cloudAccount: cloudAccountId,
        resourceId: recommendation.resourceId,
        resourceType: recommendation.resourceType,
        status: "OPEN",
      },
      {
        $set: {
          region: recommendation.region,
          severity: recommendation.severity,
          category: recommendation.category,
          action: recommendation.action,
          message: recommendation.message,
          remediation: recommendation.remediation,
          estimatedMonthlySavings: recommendation.estimatedMonthlySavings,
        },
        $setOnInsert: {
          organization: recommendation.organization,
          cloudAccount: recommendation.cloudAccount,
          resourceId: recommendation.resourceId,
          resourceType: recommendation.resourceType,
          status: "OPEN",
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    recommendations.push(savedRecommendation);
  }

  return recommendations;
};