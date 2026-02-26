import React from 'react';

/**
 * Financial Health Score
 *
 * Score is calculated out of 100 based on:
 * - Savings Rate
 * - Expense / Income Ratio
 * - Cash Flow Trend
 * - Burn Rate Trend
 */

const FinancialHealthScore = ({
  totalIncome,
  totalExpense,
  currentIncome,
  currentExpense,
  previousIncome,
  previousExpense,
}) => {
  /* ================= calculations ================= */

  const netSavings = totalIncome - totalExpense;

  const savingsRate = totalIncome === 0 ? 0 : (netSavings / totalIncome) * 100;

  const expenseIncomeRatio =
    totalIncome === 0 ? 100 : (totalExpense / totalIncome) * 100;

  const currentCashFlow = currentIncome - currentExpense;
  const previousCashFlow = previousIncome - previousExpense;

  const cashFlowTrend =
    previousCashFlow === 0
      ? currentCashFlow > 0
        ? 1
        : 0
      : currentCashFlow >= previousCashFlow
        ? 1
        : 0;

  const burnRateTrend =
    previousExpense === 0 ? 1 : currentExpense <= previousExpense ? 1 : 0;

  /* ================= scoring ================= */

  let score = 0;

  // Savings Rate (30 points)
  if (savingsRate >= 30) score += 30;
  else if (savingsRate >= 15) score += 20;
  else if (savingsRate >= 5) score += 10;

  // Expense Ratio (30 points)
  if (expenseIncomeRatio <= 50) score += 30;
  else if (expenseIncomeRatio <= 70) score += 20;
  else if (expenseIncomeRatio <= 90) score += 10;

  // Cash Flow Trend (20 points)
  if (cashFlowTrend) score += 20;

  // Burn Rate Trend (20 points)
  if (burnRateTrend) score += 20;

  const healthLabel =
    score >= 80
      ? 'Excellent'
      : score >= 60
        ? 'Good'
        : score >= 40
          ? 'Needs Attention'
          : 'Critical';

  const healthColor =
    score >= 80
      ? 'text-green-500'
      : score >= 60
        ? 'text-blue-500'
        : score >= 40
          ? 'text-yellow-500'
          : 'text-red-500';

  /* ================= UI ================= */

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div>
        <p className="text-sm text-text/60">Financial Health</p>
        <p className={`text-3xl font-semibold ${healthColor}`}>{score}/100</p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Savings Rate</span>
          <span>{savingsRate.toFixed(1)}%</span>
        </div>

        <div className="flex justify-between">
          <span>Expense / Income</span>
          <span>{expenseIncomeRatio.toFixed(1)}%</span>
        </div>

        <div className="flex justify-between">
          <span>Cash Flow Trend</span>
          <span>{cashFlowTrend ? 'Positive' : 'Negative'}</span>
        </div>

        <div className="flex justify-between">
          <span>Burn Rate Trend</span>
          <span>{burnRateTrend ? 'Improving' : 'Worsening'}</span>
        </div>
      </div>

      <div className={`text-sm font-semibold text-center mt-2 ${healthColor}`}>
        {healthLabel}
      </div>
    </div>
  );
};

export default FinancialHealthScore;
