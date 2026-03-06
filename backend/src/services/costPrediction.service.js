export const predictNextMonthCost = (last3MonthsCosts) => {

  if (!Array.isArray(last3MonthsCosts) || last3MonthsCosts.length === 0) {
    return 0;
  }

  const total = last3MonthsCosts.reduce((sum, cost) => sum + cost, 0);

  const average = total / last3MonthsCosts.length;

  const predicted = average * 1.1; // assume 10% growth

  return Number(predicted.toFixed(2));
};