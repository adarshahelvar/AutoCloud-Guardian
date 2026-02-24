import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand,
} from "@aws-sdk/client-sts";
import { resolveHttpAuthRuntimeConfig } from "@aws-sdk/client-sts/dist-types/auth/httpAuthExtensionConfiguration";

export const validateAwsConnection = async (roleArn, externalId, region) => {
  try {
    const stsClient = new STSClient({ region });

    const assumeRoleCommand = new AssumeRoleCommand({
      RoleArn: roleArn,
      RoleSessionName: "AutoCloudGuardianSession",
      ExternalId: externalId,
      DurationSeconds: 900,
    });

    const assumedRole = await stsClient.send({ assumeRoleCommand });

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
      new GetCallerIdentityCommand({}),
    );

    return identity; // It contains Account, Arn, UserId
  } catch (error) {
    throw new Error("AWS Validation failed", error.message);
  }
};
