import { LambdaClient, ListFunctionsCommand } from "@aws-sdk/client-lambda";
import ResourceInventory from "../../models/resourceInventory.model.js";

export const scanLambda = async (credentials, region, orgId, accountId) => {
  const client = new LambdaClient({ region, credentials });
  const data = await client.send(new ListFunctionsCommand({}));

  let count = 0;

  for (const fn of data.Functions || []) {
    count++;

    await ResourceInventory.findOneAndUpdate(
      { resourceId: fn.FunctionArn, cloudAccount: accountId },
      {
        organization: orgId,
        cloudAccount: accountId,
        resourceType: "LAMBDA",
        resourceId: fn.FunctionArn,
        region,
        metadata: {
          runtime: fn.Runtime,
          memorySize: fn.MemorySize,
          timeout: fn.Timeout,
        },
      },
      { upsert: true }
    );
  }

  return count;
};