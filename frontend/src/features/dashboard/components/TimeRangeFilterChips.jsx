const TIME_RANGES = [
  { label: 'All', value: 'all_time' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: '3M', value: 'last_3_months' },
  { label: '6M', value: 'last_6_months' },
  { label: 'YTD', value: 'ytd' },
];

const TimeRangeFilterChips = ({ value, onChange }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {TIME_RANGES.map((range) => {
        const isActive = value === range.value;

        return (
          <button
            key={range.value}
            data-testid={`dashboard-time-filter-${range.value}`}
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

export default TimeRangeFilterChips;
