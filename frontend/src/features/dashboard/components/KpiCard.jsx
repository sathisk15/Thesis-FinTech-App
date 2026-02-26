import React from 'react';

/**
 * KpiCard
 *
 * Displays a single KPI item
 */

const KpiCard = ({ label, value, change, icon }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex justify-between items-center">
      <div>
        <p className="text-sm text-text/60">{label}</p>
        <p className="text-2xl font-semibold text-text mt-1">{value}</p>
      </div>

      <div className="text-right space-y-1">
        <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          {icon}
        </div>

        <span
          className={`text-sm font-semibold ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {isPositive ? '+' : ''}
          {change.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default KpiCard;
