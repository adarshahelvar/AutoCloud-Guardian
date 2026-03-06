import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

export const getCostTrend = async (credentials) => {
  try {
    const client = new CostExplorerClient({
      region: "us-east-1",
      credentials,
    });

    const end = new Date();
    const start = new Date();

    // Last 6 months
    start.setMonth(start.getMonth() - 6);

    const command = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: start.toISOString().split("T")[0],
        End: end.toISOString().split("T")[0],
      },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
    });

    const response = await client.send(command);

    const trend = response.ResultsByTime.map((item) => ({
      month: item.TimePeriod.Start,
      cost: parseFloat(item.Total.UnblendedCost.Amount),
      unit: item.Total.UnblendedCost.Unit,
    }));

    return trend;
  } catch (error) {
    console.error("Cost Trend Error:", error);
    throw error;
  }
};