import React from 'react';

/**
 * SavingsRate
 *
 * Savings Rate = (Net Savings / Total Income) * 100
 */

const SavingsRate = ({ totalIncome, totalExpense }) => {
  /* ================= calculations ================= */

  const netSavings = totalIncome - totalExpense;

  const savingsRate = totalIncome === 0 ? 0 : (netSavings / totalIncome) * 100;

  const status =
    savingsRate >= 30
      ? 'Excellent'
      : savingsRate >= 20
        ? 'Good'
        : savingsRate >= 10
          ? 'Low'
          : 'Critical';

  const statusColor =
    savingsRate >= 30
      ? 'text-green-500'
      : savingsRate >= 20
        ? 'text-blue-500'
        : savingsRate >= 10
          ? 'text-yellow-500'
          : 'text-red-500';

  /* ================= UI ================= */

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div>
        <p className="text-sm text-text/60">Savings Rate</p>
        <p className="text-3xl font-semibold text-text">
          {savingsRate.toFixed(1)}%
        </p>
      </div>

      <div className="flex justify-between text-sm">
        <span>Income</span>
        <span>
          {new Intl.NumberFormat('en-IE', {
            style: 'currency',
            currency: 'EUR',
          }).format(totalIncome)}
        </span>
      </div>

      <div className="flex justify-between text-sm">
        <span>Expense</span>
        <span>
          {new Intl.NumberFormat('en-IE', {
            style: 'currency',
            currency: 'EUR',
          }).format(totalExpense)}
        </span>
      </div>

      <div className={`text-sm font-semibold ${statusColor}`}>{status}</div>
    </div>
  );
};

export default SavingsRate;
