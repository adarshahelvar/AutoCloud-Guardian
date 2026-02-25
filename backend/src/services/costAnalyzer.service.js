import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

export const getMonthlyCost = async (credentials) => {
  const client = new CostExplorerClient({
    region: "us-east-1", // Cost Explorer is always us-east-1
    credentials,
  });

  const start = new Date();
  start.setDate(1); // first day of month

  const end = new Date();

  const command = new GetCostAndUsageCommand({
    TimePeriod: {
      Start: start.toISOString().split("T")[0],
      End: end.toISOString().split("T")[0],
    },
    Granularity: "MONTHLY",
    Metrics: ["UnblendedCost"],
    GroupBy: [
      {
        Type: "DIMENSION",
        Key: "SERVICE",
      },
    ],
  });

  const response = await client.send(command);

  return response.ResultsByTime[0]?.Groups || [];
};