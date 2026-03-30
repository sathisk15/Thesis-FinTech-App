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

const CustomLineChart = ({ chartData, labelFilter }) => {
  console.log(chartData);
  return (
    <div className=" bg-card border border-border rounded-xl p-4 h-[420px] flex flex-col">
      <div className="flex justify-between mb-4">
        <div className="flex w-full justify-between items-center">
          <p className="text-sm font-medium text-text/60">
            Transaction Activity
          </p>
          {/* <span>{labelFilter}</span> */}
        </div>
      </div>
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
            {/* <Line
              type="monotone"
              dataKey="savings" // cumulative balance
              stroke="#2563eb"
              strokeWidth={4}
              dot={false}
            /> */}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CustomLineChart;

const RANGE_FILTERS = [
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
  { label: '3Y', value: '3y' },
  { label: '6Y', value: '6y' },
  // { label: 'ALL', value: 'all' },
];

export const RangeFilterChips = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {RANGE_FILTERS.map((range) => {
        const isActive = value === range.value;

        return (
          <button
            key={range.value}
            data-testid={`trends-range-filter-${range.value}`}
            onClick={() => onChange(range.value)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium
              border transition-all duration-150 cursor-pointer
              ${
                isActive
                  ? 'bg-primary/15 text-primary border-primary/40'
                  : 'bg-card text-text/60 border-border hover:bg-primary/5 hover:text-text'
              }
            `}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
};

const LABEL_FILTERS = [
  { label: '1D', value: '1d' },
  { label: '3D', value: '3d' },
  { label: '6D', value: '6d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
];

export const LabelFilterChips = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {LABEL_FILTERS.map((labelItem) => {
        const isActive = value === labelItem.value;

        return (
          <button
            key={labelItem.value}
            onClick={() => onChange(labelItem.value)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium
              border transition-all duration-150 cursor-pointer
              ${
                isActive
                  ? 'bg-primary/15 text-primary border-primary/40'
                  : 'bg-card text-text/60 border-border hover:bg-primary/5 hover:text-text'
              }
            `}
          >
            {labelItem.label}
          </button>
        );
      })}
    </div>
  );
};
