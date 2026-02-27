import React from 'react';

/**
 * KpiCard
 *
 * Displays a single KPI item
 */

const KpiCard = ({ label, value, change, icon }) => {
  const isPositive = change >= 0;

  return (
    <div
      className="
  bg-card border border-border
  rounded-2xl p-6
  flex justify-between items-start
  transition-all duration-200
  hover:border-primary/30
"
    >
      {/* Left side */}
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide uppercase text-text/50">
          {label}
        </p>

        <p className="text-1xl font-bold text-text leading-tight">{value}</p>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-3">
        {icon && (
          <div
            className="
        w-11 h-11 rounded-xl
        bg-primary/15 text-primary
        flex items-center justify-center
      "
          >
            {icon}
          </div>
        )}

        <span
          className={`text-sm font-semibold flex items-center gap-1
        ${isPositive ? 'text-green-500' : 'text-red-500'}`}
        >
          {isPositive ? '▲' : '▼'}
          {change.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default KpiCard;
