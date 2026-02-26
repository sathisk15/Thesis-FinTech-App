import React from 'react';

/**
 * TransactionActivityHeader
 *
 * Header + time filter buttons for transaction charts
 */

const TransactionActivityHeader = ({ timeFilter, onChange }) => {
  const filters = ['yearly', 'monthly', 'daily', 'hourly'];

  return (
    <div className="flex justify-between mb-4">
      <p className="text-sm font-medium text-text/60">Transaction Activity</p>

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => onChange(f)}
            className={`px-3 py-1 text-xs rounded-md border ${
              timeFilter === f
                ? 'bg-primary text-white'
                : 'border-border text-text/70'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransactionActivityHeader;
