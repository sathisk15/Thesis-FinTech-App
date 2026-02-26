import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Sector } from 'recharts';
const CustomPieChart = ({ data, title }) => {
  /* ================= helpers (UNCHANGED) ================= */

  const formatCurrency = (value, currency = 'EUR') =>
    new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
    }).format(value);

  function colorFromString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 55%)`;
  }

  /* ================= UI ================= */

  const [activeIndex, setActiveIndex] = useState(null);

  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-[420px]">
      <p className="text-sm font-medium text-text/60 mb-4">{title}</p>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            innerRadius={70}
            paddingAngle={2}
            label={false}
            labelLine={false}
            activeIndex={activeIndex}
            activeShape={(props) => (
              <Sector {...props} outerRadius={props.outerRadius + 8} />
            )}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={colorFromString(entry.name)} />
            ))}
          </Pie>

          {/* ✅ center context (UI only) */}
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-text/60 text-sm"
          >
            Total
          </text>
          <text
            x="50%"
            y="56%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-text font-semibold text-base"
          >
            {formatCurrency(totalValue)}
          </text>

          <Tooltip formatter={(v) => formatCurrency(v)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomPieChart;
