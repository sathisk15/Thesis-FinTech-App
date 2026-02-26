import React from 'react';

/**
 * IncomeExpenseBreakdown
 *
 * Displays top expense categories as percentages
 */

const IncomeExpenseBreakdown = ({
  expenseCategoryPercentages,
  incomeCategoryPercentages,
}) => {
  /* ================= UI ================= */

  return (
    <div className="flex flex-col justify-around bg-card border border-border rounded-xl p-4">
      <div>
        <p className="text-sm font-medium text-text/60 mb-3">
          Income Breakdown (%)
        </p>

        <div className="space-y-2">
          {incomeCategoryPercentages.slice(0, 5).map((item) => (
            <div key={item.category} className="flex justify-between text-sm">
              <span className="text-text/80">{item.category}</span>
              <span className="font-medium text-text">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
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
    </div>
  );
};

export default IncomeExpenseBreakdown;
