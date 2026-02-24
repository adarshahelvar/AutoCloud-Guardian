import CloudAccount from "../models/cloudAccount.model.js";
import { validateAwsConnection } from "../config/aws.js";

export const createCloudAccount = async (
  user,
  accountName,
  awsAccountId,
  roleArn,
  externalId,
  region,
) => {
  if (!user.organizationId) {
    throw new Error("Iser not associated with any organization");
  }

  const identity = await validateAwsConnection(roleArn, externalId, region);

  if (identity.Account !== awsAccountId) {
    throw new Error("AWS Account ID mismatch");
  }

  const cloudAccount = await CloudAccount.create({
    organizationId: user.organizationId,
    accountName,
    awsAccountId,
    roleArn,
    externalId,
    region,
  });

  return cloudAccount;
};
