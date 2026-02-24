const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-0 md:px-5 2xl:px-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-semibold text-text mb-2">Dashboard</h1>
            <span className="text-text/60">
              Monitor your financial activities
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-10 2xl:gap-20">
            <div className="flex items-center gap-2 border border-border rounded-md p-2">
              <input
                placeholder="Search now.."
                className="bg-transparent outline-none text-text"
              />
            </div>

            <button className="flex items-center gap-2 bg-primary py-2 px-4 rounded text-white">
              <span className="text-base">Filter By</span>
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-20">
          {[
            { title: 'Your Total Balance', value: 'US$0.00' },
            { title: 'Total Income', value: 'US$0.00' },
            { title: 'Total Expense', value: 'US$0.00' },
          ].map((item) => (
            <div
              key={item.title}
              className="w-full flex items-center justify-between gap-5 px-8 py-12 rounded-lg bg-card border border-border"
            >
              <div className="space-y-3">
                <span className="text-text/60 text-lg">{item.title}</span>
                <p className="text-2xl font-medium text-text">{item.value}</p>
              </div>

              <span className="text-success font-semibold">+10.9%</span>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-2/3">
            <p className="text-2xl font-semibold text-text/60 mb-4">
              Transaction Activity
            </p>

            <div className="bg-card border border-border rounded-lg p-4 h-[500px]">
              {/* Recharts goes here */}
            </div>
          </div>

          <div className="w-full md:w-1/3">
            <p className="text-2xl font-semibold text-text/60 mb-4">Summary</p>

            <div className="bg-card border border-border rounded-lg p-4 h-[500px]">
              {/* Pie chart goes here */}
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="flex flex-col md:flex-row gap-10 mt-20">
          <div className="w-full md:w-2/3">
            <p className="text-2xl font-semibold text-text/60 mb-4">
              Latest Transactions
            </p>

            <div className="overflow-x-auto bg-card border border-border rounded-lg">
              <table className="w-full">
                <thead className="border-b border-border text-text">
                  <tr>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Source</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody />
              </table>
            </div>
          </div>

          <div className="w-full md:w-1/3">
            <p className="text-2xl font-semibold text-text/60">Accounts</p>
            {/* <span className="text-sm text-text/60">View all your accounts</span> */}

            <div className="mt-4 bg-card border border-border rounded-lg p-4">
              {/* Accounts list */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
