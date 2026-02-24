const HistoryPage = () => {
  return (
    <div className="min-h-screen bg-background w-full">
      <div className="w-full py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <p className="text-2xl 2xl:text-3xl font-semibold text-text/60">
            Transactions Activity
          </p>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Date Filters */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label className="text-sm text-text/60 mb-1">Filter</label>
                <input
                  type="date"
                  className="h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-text/60 mb-1">To</label>
                <input
                  type="date"
                  className="h-10 px-3 rounded-md bg-background border border-border text-text outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 border border-border rounded-md px-3 py-2 bg-background">
              <input
                placeholder="Search now.."
                className="bg-transparent outline-none text-text w-full"
              />
            </div>

            {/* Actions */}
            <button className="flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-white">
              Pay
            </button>

            <button className="flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-white">
              Export
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="overflow-x-auto mt-5">
          <div className="w-full flex items-center justify-center py-10 text-text/60 text-lg">
            <span>No Transaction History</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
