import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

export const assumeCustomerRole = async (roleArn, externalId, region) => {
  const stsClient = new STSClient({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new AssumeRoleCommand({
    RoleArn: roleArn,
    RoleSessionName: "AutoCloudGuardianSession",
    ExternalId: externalId,
    DurationSeconds: 3600,
  });

  const response = await stsClient.send(command);

  return {
    accessKeyId: response.Credentials.AccessKeyId,
    secretAccessKey: response.Credentials.SecretAccessKey,
    sessionToken: response.Credentials.SessionToken,
  };
};