import { useState } from 'react';
import TransactionActivityHeader from './TransactionActivityHeader';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CustomLineChart = ({ chartData }) => {
  const [timeFilter, setTimeFilter] = useState('monthly');

  return (
    <div className=" bg-card border border-border rounded-xl p-4 h-[420px] flex flex-col">
      <TransactionActivityHeader
        timeFilter={timeFilter}
        onChange={setTimeFilter}
      />
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#16a34a"
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#dc2626"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomLineChart;
