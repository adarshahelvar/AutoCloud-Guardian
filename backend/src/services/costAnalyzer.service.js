import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

export const getMonthlyCost = async (credentials) => {
  try {
    const client = new CostExplorerClient({
      region: "us-east-1",
      credentials,
    });

    const end = new Date();
    const start = new Date();

    start.setMonth(start.getMonth() - 1);

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

    const groups = response.ResultsByTime[0].Groups || [];

    let services = groups.map((item) => ({
      service: item.Keys[0],
      cost: parseFloat(item.Metrics.UnblendedCost.Amount),
      unit: item.Metrics.UnblendedCost.Unit,
    }));

    // Remove zero cost services
    services = services.filter((s) => s.cost > 0);

    // Sort by highest cost
    services.sort((a, b) => b.cost - a.cost);

    const totalCost = services.reduce((sum, item) => sum + item.cost, 0);

    return {
      totalCost,
      services,
      topServices: services.slice(0, 5),
    };
  } catch (error) {
    console.error("Cost Explorer Error:", error);
    throw error;
  }
};