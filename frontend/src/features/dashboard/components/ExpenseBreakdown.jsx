import React from 'react';

/**
 * ExpenseBreakdown
 *
 * Displays top expense categories as percentages
 */

const ExpenseBreakdown = ({ expenseCategoryPercentages }) => {
  /* ================= UI ================= */

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-sm font-medium text-text/60 mb-3">
        Expense Breakdown (%)
      </p>

      <div className="space-y-2">
        {expenseCategoryPercentages.slice(0, 5).map((item) => (
          <div key={item.category} className="flex justify-between text-sm">
            <span className="text-text/80">{item.category}</span>
            <span className="font-medium text-text">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseBreakdown;
