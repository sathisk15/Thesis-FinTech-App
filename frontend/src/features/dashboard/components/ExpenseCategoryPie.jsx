import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * ExpenseCategoryPie
 *
 * Displays expense distribution by category
 */

const ExpenseCategoryPie = ({ data, colors }) => {
  /* ================= helpers ================= */

  const formatCurrency = (value, currency = 'EUR') =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
    }).format(value);

  /* ================= UI ================= */

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-[420px]">
      <p className="text-sm font-medium text-text/60 mb-4">
        Expense Categories
      </p>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>

          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseCategoryPie;
