import { scanEC2 } from "./scanners/ec2.scanner.js";
import { scanEBS } from "./scanners/ebs.scanner.js";
import { scanRDS } from "./scanners/rds.scanner.js";
import { scanS3 } from "./scanners/s3.scanner.js";
import { scanLambda } from "./scanners/lambda.sacanner.js";
import { scanELB } from "./scanners/elb.scanner.js";
import { scanNAT } from "./scanners/nat.scanner.js";
import { scanECS } from "./scanners/ecs.scanner.js";
import { scanEKS } from "./scanners/eks.scanner.js";

/**
 * Master Discovery Orchestrator
 * ---------------------------------
 * Executes all service scanners sequentially.
 * Each scanner:
 *  - Connects using assumed role credentials
 *  - Fetches resources
 *  - Stores in ResourceInventory
 *  - Returns count
 */

export const runDiscovery = async (
  credentials,
  region,
  organizationId,
  cloudAccountId
) => {
  const results = {
    ec2: 0,
    ebs: 0,
    rds: 0,
    s3: 0,
    lambda: 0,
    elb: 0,
    nat: 0,
    ecs: 0,
    eks: 0,
  };

  try {
    console.log("🚀 Starting Discovery...");

    /* =======================
       Core Compute Services
    ========================== */

    results.ec2 = await scanEC2(
      credentials,
      region,
      organizationId,
      cloudAccountId
    );

    results.ebs = await scanEBS(
      credentials,
      region,
      organizationId,
      cloudAccountId
    );

    results.lambda = await scanLambda(
      credentials,
      region,
      organizationId,
      cloudAccountId
    );

    /* =======================
       Databases
    ========================== */

    results.rds = await scanRDS(
      credentials,
      region,
      organizationId,
      cloudAccountId
    );

    /* =======================
       Storage
    ========================== */

    results.s3 = await scanS3(
      credentials,
      region,
      organizationId,
      cloudAccountId
    );

    /* =======================
       Networking
    ========================== */

    results.elb = await scanELB(
      credentials,
      region,
      organizationId,
      cloudAccountId
    );

    results.nat = await scanNAT(
      credentials,
      region,
      organizationId,
      cloudAccountId
    );

    /* =======================
       Containers
    ========================== */

    results.ecs = await scanECS(
      credentials,
      region,
      organizationId,
      cloudAccountId
    );

    results.eks = await scanEKS(
      credentials,
      region,
      organizationId,
      cloudAccountId
    );

    console.log("✅ Discovery Completed");

    return results;

  } catch (error) {
    console.error("❌ Discovery Error:", error.message);
    throw error;
  }
};