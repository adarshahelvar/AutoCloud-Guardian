// import {
//   CostExplorerClient,
//   GetCostAndUsageCommand,
// } from "@aws-sdk/client-cost-explorer";

// export const getFullAccountCost = async (credentials) => {
//   try {
//     const client = new CostExplorerClient({
//       region: "us-east-1", // required by AWS
//       credentials,
//     });

//     const end = new Date();
//     const start = new Date();
//     start.setMonth(start.getMonth() - 1);

//     const command = new GetCostAndUsageCommand({
//       TimePeriod: {
//         Start: start.toISOString().split("T")[0],
//         End: end.toISOString().split("T")[0],
//       },
//       Granularity: "MONTHLY",
//       Metrics: ["UnblendedCost"],

//       GroupBy: [
//         {
//           Type: "DIMENSION",
//           Key: "SERVICE",
//         },
//         {
//           Type: "DIMENSION",
//           Key: "REGION",
//         },
//       ],
//     });

//     const response = await client.send(command);

//     const groups = response.ResultsByTime[0].Groups;

//     const costData = groups.map((g) => ({
//       service: g.Keys[0],
//       region: g.Keys[1],
//       cost: parseFloat(g.Metrics.UnblendedCost.Amount),
//       unit: g.Metrics.UnblendedCost.Unit,
//     }));

//     return costData;
//   } catch (error) {
//     console.error("Cost Explorer Error:", error);
//     throw error;
//   }
// };