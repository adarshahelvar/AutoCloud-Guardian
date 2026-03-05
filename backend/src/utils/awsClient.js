// import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

// export const assumeCustomerRole = async (roleArn, externalId, region) => {
//   const stsClient = new STSClient({
//     region: region,
//     credentials: {
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     },
//   });

//   const command = new AssumeRoleCommand({
//     RoleArn: roleArn,
//     RoleSessionName: "AutoCloudGuardianSession",
//     ExternalId: externalId,
//     DurationSeconds: 3600,
//   });

//   const response = await stsClient.send(command);

//   return {
//     accessKeyId: response.Credentials.AccessKeyId,
//     secretAccessKey: response.Credentials.SecretAccessKey,
//     sessionToken: response.Credentials.SessionToken,
//   };
// };
import {
  STSClient,
  AssumeRoleCommand,
  GetCallerIdentityCommand,
} from "@aws-sdk/client-sts";

/*
------------------------------------------------
ASSUME CUSTOMER ROLE
------------------------------------------------
*/
export const assumeCustomerRole = async (roleArn, externalId, region) => {
  try {

    const stsClient = new STSClient({
      region,
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

    if (!response || !response.Credentials) {
      throw new Error("Failed to assume role");
    }

    const creds = response.Credentials;

    return {
      accessKeyId: creds.AccessKeyId,
      secretAccessKey: creds.SecretAccessKey,
      sessionToken: creds.SessionToken,
    };

  } catch (error) {
    console.error("AssumeRole Error:", error);
    throw error;
  }
};

/*
------------------------------------------------
VALIDATE AWS CONNECTION
------------------------------------------------
*/
export const validateAwsConnection = async (roleArn, externalId, region) => {
  try {

    const credentials = await assumeCustomerRole(roleArn, externalId, region);

    const stsClient = new STSClient({
      region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      },
    });

    const identity = await stsClient.send(new GetCallerIdentityCommand({}));

    return identity;

  } catch (error) {
    console.error("AWS Validation Error:", error);
    throw new Error("AWS validation failed: " + error.message);
  }
};