import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand,
} from "@aws-sdk/client-sts";

export const validateAwsConnection = async (
  roleArn,
  externalId,
  region
) => {
  try {
    const stsClient = new STSClient({ region });

    const assumeRoleCommand = new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: "AutoCloudGuardianSession",
      ExternalId: externalId,
      DurationSeconds: 900,
    });

    const assumedRole = await stsClient.send(assumeRoleCommand);

    if (!assumedRole.Credentials) {
      throw new Error("Failed to assume role");
    }

    const tempCredentials = {
      accessKeyId: assumedRole.Credentials.AccessKeyId,
      secretAccessKey: assumedRole.Credentials.SecretAccessKey,
      sessionToken: assumedRole.Credentials.SessionToken,
    };

    const identityClient = new STSClient({
      region,
      credentials: tempCredentials,
    });

    const identity = await identityClient.send(
      new GetCallerIdentityCommand({})
    );

    return identity;
  } catch (error) {
    console.error("AWS Validation Error:", error);
    throw new Error("AWS Validation failed: " + error.message);
  }
};