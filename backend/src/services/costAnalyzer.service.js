import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

export const getMonthlyCost = async (credentials) => {
  const client = new CostExplorerClient({
    region: "us-east-1", // Cost Explorer works only in us-east-1
    credentials,
  });

  const start = new Date();
  start.setDate(1);

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

  const groups = response.ResultsByTime[0]?.Groups || [];

  const formatted = groups
    .map((item) => ({
      service: item.Keys[0],
      cost: parseFloat(item.Metrics.UnblendedCost.Amount),
    }))
    .filter((item) => item.cost > 0)
    .sort((a, b) => b.cost - a.cost);

  const total = formatted.reduce((sum, item) => sum + item.cost, 0);

  return {
    totalMonthlyCost: total,
    services: formatted,
  };
};