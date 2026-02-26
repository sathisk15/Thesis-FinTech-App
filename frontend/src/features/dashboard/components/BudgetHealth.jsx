import React from 'react';

/**
 * BudgetHealth
 *
 * Budget health is determined by Expense / Income ratio
 */

const BudgetHealth = ({ totalIncome, totalExpense }) => {
  /* ================= calculations ================= */

  const expenseIncomeRatio =
    totalIncome === 0 ? 0 : (totalExpense / totalIncome) * 100;

  let status = 'Excellent';
  let color = 'text-green-500';
  let description = 'Your spending is well under control';

  if (expenseIncomeRatio >= 50 && expenseIncomeRatio < 70) {
    status = 'Healthy';
    color = 'text-blue-500';
    description = 'You are managing your expenses well';
  } else if (expenseIncomeRatio >= 70 && expenseIncomeRatio < 90) {
    status = 'Risk';
    color = 'text-yellow-500';
    description = 'Expenses are getting high';
  } else if (expenseIncomeRatio >= 90) {
    status = 'Critical';
    color = 'text-red-500';
    description = 'Expenses almost equal income';
  }

  /* ================= UI ================= */

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div>
        <p className="text-sm text-text/60">Budget Health</p>
        <p className={`text-3xl font-semibold ${color}`}>
          {expenseIncomeRatio.toFixed(1)}%
        </p>
      </div>

      <div className="space-y-1">
        <p className={`text-sm font-semibold ${color}`}>{status}</p>
        <p className="text-sm text-text/60">{description}</p>
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
    </div>
  );
};

export default BudgetHealth;
