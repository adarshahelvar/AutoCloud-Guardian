import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

/*
--------------------------------------------
GET MONTHLY COST FOR FULL AWS ACCOUNT
--------------------------------------------
*/
export const getMonthlyCost = async (credentials) => {
  try {
    const client = new CostExplorerClient({
      region: "us-east-1", // Cost Explorer works only here
      credentials,
    });

    const end = new Date();
    const start = new Date();

    // last 30 days
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
        {
          Type: "DIMENSION",
          Key: "REGION",
        },
      ],
    });

    const response = await client.send(command);

    const groups = response.ResultsByTime[0].Groups || [];

    const formatted = groups.map((item) => ({
      service: item.Keys[0],
      region: item.Keys[1],
      cost: parseFloat(item.Metrics.UnblendedCost.Amount),
      unit: item.Metrics.UnblendedCost.Unit,
    }));

    const totalCost = formatted.reduce((sum, item) => sum + item.cost, 0);

    return {
      totalCost,
      services: formatted,
    };
  } catch (error) {
    console.error("Cost Explorer Error:", error);
    throw error;
  }
};
