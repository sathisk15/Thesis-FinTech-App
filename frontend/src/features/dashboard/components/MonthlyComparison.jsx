import React from 'react';

/**
 * MonthlyComparison
 *
 * Compares current month vs previous month values
 * for Income, Expense, and Net Savings.
 */

const MonthlyComparison = ({
  currentIncome,
  previousIncome,
  currentExpense,
  previousExpense,
}) => {
  /* ================= calculations ================= */

  const currentNet = currentIncome - currentExpense;
  const previousNet = previousIncome - previousExpense;

  const calculateChange = (current, previous) => {
    if (previous === 0 && current > 0) return 100;
    if (previous === 0 && current === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const incomeChange = calculateChange(currentIncome, previousIncome);
  const expenseChange = calculateChange(currentExpense, previousExpense);
  const netChange = calculateChange(currentNet, previousNet);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);

  const renderRow = (label, current, previous, change, inverse = false) => {
    const positive = inverse ? change <= 0 : change >= 0;

    return (
      <div className="flex justify-between items-center text-sm">
        <div>
          <p className="font-medium text-text">{label}</p>
          <p className="text-text/60">
            {formatCurrency(previous)} → {formatCurrency(current)}
          </p>
        </div>

        <span
          className={`font-semibold ${
            positive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(1)}%
        </span>
      </div>
    );
  };

  /* ================= UI ================= */

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div>
        <p className="text-sm text-text/60">Monthly Comparison</p>
        <p className="text-lg font-semibold text-text">
          This Month vs Last Month
        </p>
      </div>

      <div className="space-y-3">
        {renderRow('Income', currentIncome, previousIncome, incomeChange)}

        {renderRow(
          'Expense',
          currentExpense,
          previousExpense,
          expenseChange,
          true, // inverse logic (lower expense is better)
        )}

        {renderRow('Net Savings', currentNet, previousNet, netChange)}
      </div>
    </div>
  );
};

export default MonthlyComparison;
