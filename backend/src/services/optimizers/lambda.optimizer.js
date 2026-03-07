import {
  LambdaClient,
  ListFunctionsCommand,
} from "@aws-sdk/client-lambda";

export const optimizeLambda = async (credentials, region) => {
  const client = new LambdaClient({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  const recommendations = [];

  const response = await client.send(new ListFunctionsCommand({}));

  for (const fn of response.Functions || []) {
    recommendations.push({
      resourceId: fn.FunctionName,
      resourceType: "LAMBDA",
      region,
      severity: "LOW",
      message: `Lambda function ${fn.FunctionName} should be reviewed for optimization.`,
      estimatedMonthlySavings: 1,
    });
  }

  console.log(`Lambda recommendations in ${region}:`, recommendations);

  return recommendations;
};